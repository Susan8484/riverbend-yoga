// Class and event information for the interest selector.
const classOptions = [
  {
    id: "gentle",
    description:
      "Gentle Beginnings: A welcoming option for beginners who prefer a gentle introduction to yoga."
  },
  {
    id: "vinyasa",
    description:
      "Vinyasa Flow: Connect movement and breathing in a flowing yoga practice."
  },
  {
    id: "restorative",
    description:
      "Restorative Reset: Slow down with supported poses and restful practice."
  },
  {
    id: "private",
    description:
      "Private session: Request individual guidance based on your goals and experience."
  },
  {
    id: "october",
    description:
      "October beginner workshop: Explore basic poses and ask questions. First Saturday, 1–2 p.m.; $25."
  },
  {
    id: "november",
    description:
      "November chair yoga workshop: Explore seated and supported movement. First Saturday, 1–2 p.m.; $25."
  },
  {
    id: "december",
    description:
      "December restorative workshop: Enjoy supported rest and gentle practice. First Saturday, 1–2 p.m.; $25."
  }
];

const interestSelect = document.querySelector("#interest");
const storageKey = "riverbend-class-interest";

function showClassDetails(details, saved = false) {
  const selectedClass = classOptions.find(
    (option) => option.id === interestSelect.value
  );

  details.textContent = selectedClass
    ? selectedClass.description
    : "Choose a class or event to learn more.";

  if (saved && selectedClass) {
    details.textContent += " Your previous selection has been restored.";
  }
}

function saveClassPreference() {
  try {
    localStorage.setItem(storageKey, interestSelect.value);
  } catch (error) {
    // The selector still works if browser storage is unavailable.
    console.warn("Class preference could not be saved.", error);
  }
}

function restoreClassPreference() {
  try {
    const savedChoice = localStorage.getItem(storageKey);

    if (classOptions.some((option) => option.id === savedChoice)) {
      interestSelect.value = savedChoice;
      return true;
    }
  } catch (error) {
    console.warn("Class preference could not be restored.", error);
  }

  return false;
}

function initializeClassSelector() {
  if (!interestSelect) return;

  const details = document.createElement("p");
  details.id = "class-details";
  details.className = "class-details";
  details.setAttribute("role", "status");

  interestSelect.closest("p").after(details);

  const restored = restoreClassPreference();
  showClassDetails(details, restored);

  interestSelect.addEventListener("change", () => {
    showClassDetails(details);
    saveClassPreference();
  });
}

initializeClassSelector();

// Check form entries and return a helpful error message.
function getFieldError(field) {
  const value = field.value.trim();

  if (field.type === "radio") {
    return field.form.querySelector(
      'input[name="contact-method"]:checked'
    ) ? "" : "Choose your preferred contact method.";
  }

  if (field.required && !value) {
    return "Please complete this required field.";
  }

  if (field.type === "email" && field.validity.typeMismatch) {
    return "Enter a valid email address, such as name@example.com.";
  }

  if (field.id === "full-name" && value.length > 100) {
    return "Use no more than 100 characters for your name.";
  }

  if (
    field.id === "message" &&
    (value.length < 10 || value.length > 1000)
  ) {
    return "Enter a message between 10 and 1,000 characters.";
  }

  if (field.id === "phone") {
    const phonePreferred = field.form.querySelector(
      "#contact-phone"
    ).checked;

    if (phonePreferred && !value) {
      return "Enter a phone number if you prefer a phone call.";
    }

    if (value && !/^[+()\d\s.-]{7,25}$/.test(value)) {
      return "Enter a phone number using 7–25 characters: numbers, spaces, +, parentheses, dots, or hyphens.";
    }
  }

  return "";
}

// Display feedback beside a field and mark its validity.
function displayFieldError(field) {
  const message = getFieldError(field);
  const error = document.getElementById(field.id + "-error");

  error.textContent = message;
  error.hidden = !message;

  const relatedFields = field.type === "radio"
    ? field.form.querySelectorAll('input[name="contact-method"]')
    : [field];

  relatedFields.forEach((item) => {
    item.setAttribute("aria-invalid", String(Boolean(message)));
    item.classList.toggle("invalid", Boolean(message));
  });

  return !message;
}

function initializeFormValidation() {
  const form = document.querySelector("form");
  if (!form) return;

  // This second array organizes the fields we validate.
  const fieldIds = [
    "full-name",
    "email",
    "phone",
    "interest",
    "experience",
    "contact-email",
    "message"
  ];

  const fields = fieldIds.map((id) => document.getElementById(id));
  let attemptedSubmit = false;

  fields.forEach((field) => {
    const error = document.createElement("p");
    error.id = field.id + "-error";
    error.className = "field-error";
    error.hidden = true;

    const container = field.type === "radio"
      ? field.closest("fieldset")
      : field.closest("p");

    container.append(error);

    const relatedFields = field.type === "radio"
      ? form.querySelectorAll('input[name="contact-method"]')
      : [field];

    relatedFields.forEach((item) => {
      const existingHelp = item.getAttribute("aria-describedby") || "";
      item.setAttribute(
        "aria-describedby",
        (existingHelp + " " + error.id).trim()
      );
    });
  });

  const status = document.createElement("p");
  status.className = "form-status";
  status.setAttribute("role", "status");
  form.append(status);

  function recheckForm() {
    status.textContent = "";

    if (attemptedSubmit) {
      fields.forEach(displayFieldError);
    }
  }

  form.addEventListener("input", recheckForm);
  form.addEventListener("change", recheckForm);

  form.addEventListener("submit", (event) => {
    // This practice form checks entries without sending a request.
    event.preventDefault();
    attemptedSubmit = true;

    const results = fields.map(displayFieldError);
    const firstInvalid = results.indexOf(false);

    if (firstInvalid !== -1) {
      status.textContent = "Please correct the indicated fields.";
      fields[firstInvalid].focus();
      return;
    }

    status.textContent =
      "Your practice request passes validation. No request has been sent and no place has been reserved.";
  });

  // Use our nearby messages instead of browser validation popups.
  form.noValidate = true;
}

initializeFormValidation();