const PROFILE_STORAGE_KEY = "shotmarket_profile";
const BANK_STORAGE_KEY = "shotmarket_bank_information";

const defaultProfile = {
  fullName: "Mohammad Jawad",
  professionalTitle: "Professional Photographer",
  email: "photographer@example.com",
  phone: "",
  location: "Astana, Kazakhstan",
  bio: "Professional photographer specializing in events, portraits and memorable moments.",
  website: "",
  instagram: "",
  facebook: "",
  avatar: "",
};

const defaultBank = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  currency: "USD",
};

function getProfile() {
  try {
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!savedProfile) {
      return {
        ...defaultProfile,
      };
    }
    return {
      ...defaultProfile,
      ...JSON.parse(savedProfile),
    };
  } catch (error) {
    console.error("Could not load profile:", error);
    return {
      ...defaultProfile,
    };
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error("Could not save profile:", error);
    return false;
  }
}

function getBankInformation() {
  try {
    const savedBank = localStorage.getItem(BANK_STORAGE_KEY);
    if (!savedBank) {
      return {
        ...defaultBank,
      };
    }
    return {
      ...defaultBank,
      ...JSON.parse(savedBank),
    };
  } catch (error) {
    console.error("Could not load bank information:", error);
    return {
      ...defaultBank,
    };
  }
}

function saveBankInformation(bank) {
  try {
    localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(bank));
    return true;
  } catch (error) {
    console.error("Could not save bank information:", error);
    return false;
  }
}

async function syncBankInformation() {
  const user = await getCurrentUser();
  if (!user) return;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("bank_name, bank_account_name, bank_account_number, bank_currency")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Could not load saved payment information:", error);
    return;
  }

  if (data?.bank_name && data?.bank_account_name && data?.bank_account_number) {
    saveBankInformation({
      bankName: data.bank_name,
      accountName: data.bank_account_name,
      accountNumber: data.bank_account_number,
      currency: data.bank_currency || "KZT",
    });
  }
}

function loadProfile() {
  const profile = getProfile();

  document.getElementById("fullName").value = profile.fullName;
  document.getElementById("professionalTitle").value =
    profile.professionalTitle;
  document.getElementById("email").value = profile.email;
  document.getElementById("phone").value = profile.phone;
  document.getElementById("location").value = profile.location;
  document.getElementById("bio").value = profile.bio;
  document.getElementById("website").value = profile.website;
  document.getElementById("instagram").value = profile.instagram;
  document.getElementById("facebook").value = profile.facebook;

  updateProfilePreview(profile);
}

function updateProfilePreview(profile) {
  const name = profile.fullName || "Photographer";
  document.getElementById("profileDisplayName").textContent = name;
  document.getElementById("profileDisplayLocation").textContent =
    profile.location || "Location not set";

  const words = name.trim().split(/\s+/).filter(Boolean);
  let initials = "";
  if (words.length >= 2) {
    initials = words[0][0] + words[words.length - 1][0];
  } else if (words.length === 1) {
    initials = words[0].substring(0, 2);
  } else {
    initials = "PH";
  }
  document.getElementById("avatarInitials").textContent =
    initials.toUpperCase();

  const avatar = document.getElementById("profileAvatar");
  if (profile.avatar) {
    avatar.innerHTML = `
            <img
                src="${profile.avatar}"
                alt="Profile photo"
            >
        `;
  } else {
    avatar.innerHTML = `
            <span id="avatarInitials">
                ${initials.toUpperCase()}
            </span>
        `;
  }
}

function loadBankInformation() {
  const bank = getBankInformation();
  document.getElementById("bankName").value = bank.bankName;
  document.getElementById("accountName").value = bank.accountName;
  document.getElementById("accountNumber").value = bank.accountNumber;
  document.getElementById("paymentCurrency").value = bank.currency;
}

document
  .getElementById("profileForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const profile = {
      fullName: document.getElementById("fullName").value.trim(),
      professionalTitle: document
        .getElementById("professionalTitle")
        .value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      location: document.getElementById("location").value.trim(),
      bio: document.getElementById("bio").value.trim(),
      website: document.getElementById("website").value.trim(),
      instagram: document.getElementById("instagram").value.trim(),
      facebook: document.getElementById("facebook").value.trim(),
      avatar: getProfile().avatar || "",
    };

    if (saveProfile(profile)) {
      updateProfilePreview(profile);
      showToast("Profile saved successfully.");
    }
  });

document
  .getElementById("bankForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const bank = {
      bankName: document.getElementById("bankName").value.trim(),
      accountName: document.getElementById("accountName").value.trim(),
      accountNumber: document.getElementById("accountNumber").value.trim(),
      currency: document.getElementById("paymentCurrency").value,
    };

    const user = await getCurrentUser();
    if (!user) {
      showToast("Please sign in before saving payment information.");
      return;
    }

    const { error } = await supabaseClient
      .from("profiles")
      .update({
        bank_name: bank.bankName,
        bank_account_name: bank.accountName,
        bank_account_number: bank.accountNumber,
        bank_currency: bank.currency,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Could not save payment information:", error);
      showToast("Could not save payment information. Please try again.");
      return;
    }

    saveBankInformation(bank);
    showToast("Payment information saved successfully.");
  });

document
  .getElementById("avatarInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      const profile = getProfile();
      profile.avatar = e.target.result;
      saveProfile(profile);
      updateProfilePreview(profile);
      showToast("Profile photo updated.");
    };

    reader.readAsDataURL(file);
  });

document.getElementById("cancelProfile").addEventListener("click", function () {
  loadProfile();
  showToast("Changes discarded.");
});

document
  .getElementById("changePasswordBtn")
  .addEventListener("click", function () {
    showToast("Password management will be connected to the backend later.");
  });

document
  .getElementById("notificationToggle")
  .addEventListener("change", function () {
    localStorage.setItem("shotmarket_notifications", this.checked);
    showToast(
      this.checked ? "Notifications enabled." : "Notifications disabled.",
    );
  });

function loadNotificationState() {
  const saved = localStorage.getItem("shotmarket_notifications");
  if (saved !== null) {
    document.getElementById("notificationToggle").checked = saved === "true";
  }
}

function showToast(message) {
  const toast = document.getElementById("profileToast");
  const messageElement = document.getElementById("toastMessage");
  messageElement.textContent = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}

function loadStatistics() {
  try {
    const albums = JSON.parse(localStorage.getItem("shotmarket_albums")) || [];

    document.getElementById("albumCount").textContent = albums.length;

    let totalPhotos = 0;

    albums.forEach(function (album) {
      if (album.photos && Array.isArray(album.photos)) {
        totalPhotos += album.photos.length;
      }
    });

    document.getElementById("photoCount").textContent = totalPhotos;
  } catch (error) {
    console.error("Could not load statistics:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await syncBankInformation();
  loadProfile();
  loadBankInformation();
  loadNotificationState();
  loadStatistics();
});
