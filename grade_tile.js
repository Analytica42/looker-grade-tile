looker.plugins.visualizations.add({
  id: "grade_tile",
  label: "Grade Tile",
  options: {
    // Content Section
    title_text: {
      section: "Content",
      order: 1,
      type: "string",
      label: "Title Text",
      default: ""
    },
    subtitle_text: {
      section: "Content",
      order: 2,
      type: "string",
      label: "Subtitle Text",
      default: ""
    },
    show_numeric_value: {
      section: "Content",
      order: 3,
      type: "boolean",
      label: "Show Numeric Value",
      default: true
    },
    
    // Appearance Section
    font_size_grade: {
      section: "Appearance",
      order: 1,
      type: "number",
      label: "Grade Font Size",
      default: 36
    },
    font_size_title: {
      section: "Appearance",
      order: 2,
      type: "number",
      label: "Title Font Size",
      default: 16
    },
    title_color: {
      section: "Appearance",
      order: 3,
      type: "string",
      label: "Title Color",
      display: "color",
      default: "#282828"
    },
    subtitle_color: {
      section: "Appearance",
      order: 4,
      type: "string",
      label: "Subtitle Color",
      display: "color",
      default: "#808080"
    },
    ring_size: {
      section: "Appearance",
      order: 5,
      type: "number",
      label: "Ring Size (px)",
      default: 120
    },
    ring_thickness: {
      section: "Appearance",
      order: 6,
      type: "number",
      label: "Ring Thickness (px)",
      default: 4
    },
    
    // Grade Colors Section
    a_color: {
      section: "Grade Colors",
      order: 1,
      type: "string",
      label: "A Grade Color",
      display: "color",
      default: "#00AA00"  // Green
    },
    b_color: {
      section: "Grade Colors",
      order: 2,
      type: "string",
      label: "B Grade Color",
      display: "color",
      default: "#88AA00"  // Yellow-green
    },
    c_color: {
      section: "Grade Colors",
      order: 3,
      type: "string",
      label: "C Grade Color",
      display: "color",
      default: "#AAAA00"  // Yellow
    },
    d_color: {
      section: "Grade Colors",
      order: 4,
      type: "string",
      label: "D Grade Color",
      display: "color",
      default: "#AA5500"  // Orange
    },
    f_color: {
      section: "Grade Colors",
      order: 5,
      type: "string",
      label: "F Grade Color",
      display: "color",
      default: "#AA0000"  // Red
    }
  },

  // Set up the initial state of the visualization
  create: function(element, config) {
    // Apply defaults immediately during creation
    config = this._applyDefaults(config || {});
    
    element.innerHTML = `
      <style>
        .grade-tile-container {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
          position: relative;
        }
        .grade-title {
          font-weight: bold;
          margin-bottom: 5px;
          z-index: 2;
          color: ${config.title_color};
          font-size: ${config.font_size_title}px;
        }
        .grade-display {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2;
        }
        .grade-ring {
          position: absolute;
          border-radius: 50%;
          border-style: solid;
          transform: translate(-50%, -50%);
          left: 50%;
          top: 50%;
          z-index: 1;
          background-color: transparent;
          width: ${config.ring_size}px;
          height: ${config.ring_size}px;
          border-width: ${config.ring_thickness}px;
        }
        .grade-letter {
          font-weight: bold;
          z-index: 2;
          font-size: ${config.font_size_grade}px;
        }
        .grade-subtitle {
          margin-top: 10px;
          z-index: 2;
          color: ${config.subtitle_color};
        }
      </style>
    `;

    // Create container elements for the tile visualization
    this._container = element.appendChild(document.createElement("div"));
    this._container.className = "grade-tile-container";
    
    // Create the ring
    this._ringElement = this._container.appendChild(document.createElement("div"));
    this._ringElement.className = "grade-ring";

    this._titleElement = this._container.appendChild(document.createElement("div"));
    this._titleElement.className = "grade-title";

    this._gradeDisplay = this._container.appendChild(document.createElement("div"));
    this._gradeDisplay.className = "grade-display";

    this._gradeLetter = this._gradeDisplay.appendChild(document.createElement("span"));
    this._gradeLetter.className = "grade-letter";

    this._subtitleElement = this._container.appendChild(document.createElement("div"));
    this._subtitleElement.className = "grade-subtitle";
    
    // Set initial values with defaults
    this._titleElement.innerText = config.title_text || "";
    this._titleElement.style.display = config.title_text && config.title_text.trim() !== "" ? "block" : "none";
    
    this._subtitleElement.innerText = config.subtitle_text || "";
    this._subtitleElement.style.display = config.subtitle_text && config.subtitle_text.trim() !== "" ? "block" : "none";
    
    // Set default colors for ring and grade letter
    // We'll use the "F" color as default initially before data is loaded
    const defaultColor = config.f_color;
    this._ringElement.style.borderColor = defaultColor;
    this._gradeLetter.style.color = defaultColor;
  },

  // Render in response to data or settings changes
  updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
    this.clearErrors();

    // Apply default settings if not provided
    config = this._applyDefaults(config || {});

    if (queryResponse.fields.measures.length < 1) {
      this.addError({title: "Insufficient Data", message: "This visualization requires at least one measure."});
      return;
    }

    // Get the measure value
    const measureName = queryResponse.fields.measures[0].name;
    const numericValue = data && data[0] && data[0][measureName] ? data[0][measureName].value || 0 : 0;  // More robust null checking

    // Determine the grade based on the numeric value
    const gradeInfo = this.getGradeInfo(numericValue, config);
    const { gradeLetter, gradeColor } = gradeInfo;
    
    // Update the ring element
    const ringSize = config.ring_size;
    const ringThickness = config.ring_thickness;
    this._ringElement.style.width = `${ringSize}px`;
    this._ringElement.style.height = `${ringSize}px`;
    this._ringElement.style.borderColor = gradeColor;
    this._ringElement.style.borderWidth = `${ringThickness}px`;

    // Update the title element (only show if title text is provided)
    if (config.title_text && config.title_text.trim() !== "") {
      this._titleElement.innerText = config.title_text;
      this._titleElement.style.display = "block";
    } else {
      this._titleElement.style.display = "none";
    }
    this._titleElement.style.color = config.title_color;
    this._titleElement.style.fontSize = `${config.font_size_title}px`;

    // Update the grade display
    this._gradeLetter.innerText = gradeLetter;
    this._gradeLetter.style.color = gradeColor;
    this._gradeLetter.style.fontSize = `${config.font_size_grade}px`;

    // Update the subtitle with the numeric value if enabled
    if (config.show_numeric_value && config.subtitle_text && config.subtitle_text.trim() !== "") {
      this._subtitleElement.innerText = `${config.subtitle_text}: ${numericValue.toFixed(1)}`;
      this._subtitleElement.style.display = "block";
    } else if (config.subtitle_text && config.subtitle_text.trim() !== "") {
      this._subtitleElement.innerText = config.subtitle_text;
      this._subtitleElement.style.display = "block";
    } else {
      this._subtitleElement.style.display = "none";
    }
    this._subtitleElement.style.color = config.subtitle_color;

    doneRendering();
  },

  // Apply default settings if not provided
  _applyDefaults: function(config) {
    config = config || {};
    const defaults = {
      title_text: "",
      subtitle_text: "",
      title_color: "#282828",
      subtitle_color: "#808080",
      show_numeric_value: true,
      font_size_grade: 36,
      font_size_title: 16,
      ring_size: 120,
      ring_thickness: 4,
      a_color: "#00AA00",
      b_color: "#88AA00",
      c_color: "#AAAA00",
      d_color: "#AA5500",
      f_color: "#AA0000"
    };

    // For each property in defaults, use it if the config value is undefined, null or empty string for color fields
    Object.keys(defaults).forEach(key => {
      if (config[key] === undefined || config[key] === null || 
          (key.includes('color') && config[key] === "")) {
        config[key] = defaults[key];
      }
    });

    return config;
  },

  // Helper function to determine grade letter and color
  getGradeInfo: function(value, config) {
    let gradeLetter, gradeColor;

    // Ensure config values exist
    config = this._applyDefaults(config);

    // Determine the base grade (A, B, C, D, F)
    if (value >= 90) {
      gradeColor = config.a_color;
      if (value >= 97) {
        gradeLetter = 'A+';
      } else if (value >= 93) {
        gradeLetter = 'A';
      } else {
        gradeLetter = 'A-';
      }
    } else if (value >= 80) {
      gradeColor = config.b_color;
      if (value >= 87) {
        gradeLetter = 'B+';
      } else if (value >= 83) {
        gradeLetter = 'B';
      } else {
        gradeLetter = 'B-';
      }
    } else if (value >= 70) {
      gradeColor = config.c_color;
      if (value >= 77) {
        gradeLetter = 'C+';
      } else if (value >= 73) {
        gradeLetter = 'C';
      } else {
        gradeLetter = 'C-';
      }
    } else if (value >= 60) {
      gradeColor = config.d_color;
      if (value >= 67) {
        gradeLetter = 'D+';
      } else if (value >= 63) {
        gradeLetter = 'D';
      } else {
        gradeLetter = 'D-';
      }
    } else {
      gradeLetter = 'F';
      gradeColor = config.f_color;
    }

    return { gradeLetter, gradeColor };
  }
});
