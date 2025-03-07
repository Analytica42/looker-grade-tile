looker.plugins.visualizations.add({
    id: "grade_tile",
    label: "Grade Tile",
    options: {
      title_text: {
        type: "string",
        label: "Title Text",
        default: "Grade"
      },
      subtitle_text: {
        type: "string",
        label: "Subtitle Text",
        default: "Score"
      },
      title_color: {
        type: "string",
        label: "Title Color",
        display: "color",
        default: "#282828"
      },
      subtitle_color: {
        type: "string",
        label: "Subtitle Color",
        display: "color",
        default: "#808080"
      },
      show_numeric_value: {
        type: "boolean",
        label: "Show Numeric Value",
        default: true
      },
      font_size_grade: {
        type: "number",
        label: "Grade Font Size",
        default: 36
      },
      font_size_title: {
        type: "number",
        label: "Title Font Size",
        default: 16
      },
      a_plus_color: {
        type: "string",
        label: "A+ Color",
        display: "color",
        default: "#00AA00"
      },
      a_color: {
        type: "string",
        label: "A Color",
        display: "color",
        default: "#00AA00"
      },
      a_minus_color: {
        type: "string",
        label: "A- Color",
        display: "color",
        default: "#00AA00"
      },
      b_plus_color: {
        type: "string",
        label: "B+ Color",
        display: "color",
        default: "#88AA00"
      },
      b_color: {
        type: "string",
        label: "B Color",
        display: "color",
        default: "#88AA00"
      },
      b_minus_color: {
        type: "string",
        label: "B- Color",
        display: "color",
        default: "#88AA00"
      },
      c_plus_color: {
        type: "string",
        label: "C+ Color",
        display: "color",
        default: "#AAAA00"
      },
      c_color: {
        type: "string",
        label: "C Color",
        display: "color",
        default: "#AAAA00"
      },
      c_minus_color: {
        type: "string",
        label: "C- Color",
        display: "color",
        default: "#AAAA00"
      },
      d_plus_color: {
        type: "string",
        label: "D+ Color",
        display: "color",
        default: "#AA5500"
      },
      d_color: {
        type: "string",
        label: "D Color",
        display: "color",
        default: "#AA5500"
      },
      d_minus_color: {
        type: "string",
        label: "D- Color",
        display: "color",
        default: "#AA5500"
      },
      f_color: {
        type: "string",
        label: "F Color",
        display: "color",
        default: "#AA0000"
      }
    },
  
    // Set up the initial state of the visualization
    create: function(element, config) {
      element.innerHTML = `
        <style>
          .grade-tile-container {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
            overflow: hidden;
            box-sizing: border-box;
          }
          .grade-title {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .grade-display {
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .grade-letter {
            font-weight: bold;
          }
          .grade-subtitle {
            margin-top: 10px;
          }
        </style>
      `;
  
      // Create container elements for the tile visualization.
      this._container = element.appendChild(document.createElement("div"));
      this._container.className = "grade-tile-container";
  
      this._titleElement = this._container.appendChild(document.createElement("div"));
      this._titleElement.className = "grade-title";
  
      this._gradeDisplay = this._container.appendChild(document.createElement("div"));
      this._gradeDisplay.className = "grade-display";
  
      this._gradeLetter = this._gradeDisplay.appendChild(document.createElement("span"));
      this._gradeLetter.className = "grade-letter";
  
      this._subtitleElement = this._container.appendChild(document.createElement("div"));
      this._subtitleElement.className = "grade-subtitle";
    },
  
    // Render in response to data or settings changes
    updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
      this.clearErrors();
  
      if (queryResponse.fields.measures.length < 1) {
        this.addError({title: "Insufficient Data", message: "This visualization requires at least one measure."});
        return;
      }
  
      // Get the measure value
      const measureName = queryResponse.fields.measures[0].name;
      const numericValue = data[0][measureName].value;
  
      // Determine the grade based on the numeric value
      const gradeInfo = this.getGradeInfo(numericValue, config);
      const { gradeLetter, gradeColor } = gradeInfo;
  
      // Update the title element
      this._titleElement.innerText = config.title_text;
      this._titleElement.style.color = config.title_color;
      this._titleElement.style.fontSize = `${config.font_size_title}px`;
  
      // Update the grade display
      this._gradeLetter.innerText = gradeLetter;
      this._gradeLetter.style.color = gradeColor;
      this._gradeLetter.style.fontSize = `${config.font_size_grade}px`;
  
      // Update the subtitle with the numeric value if enabled
      if (config.show_numeric_value) {
        this._subtitleElement.innerText = `${config.subtitle_text}: ${numericValue.toFixed(1)}`;
      } else {
        this._subtitleElement.innerText = config.subtitle_text;
      }
      this._subtitleElement.style.color = config.subtitle_color;
  
      doneRendering();
    },
  
    // Helper function to determine grade letter and color
    getGradeInfo: function(value, config) {
      let gradeLetter, gradeColor;
  
      if (value >= 97) {
        gradeLetter = 'A+';
        gradeColor = config.a_plus_color;
      } else if (value >= 93) {
        gradeLetter = 'A';
        gradeColor = config.a_color;
      } else if (value >= 90) {
        gradeLetter = 'A-';
        gradeColor = config.a_minus_color;
      } else if (value >= 87) {
        gradeLetter = 'B+';
        gradeColor = config.b_plus_color;
      } else if (value >= 83) {
        gradeLetter = 'B';
        gradeColor = config.b_color;
      } else if (value >= 80) {
        gradeLetter = 'B-';
        gradeColor = config.b_minus_color;
      } else if (value >= 77) {
        gradeLetter = 'C+';
        gradeColor = config.c_plus_color;
      } else if (value >= 73) {
        gradeLetter = 'C';
        gradeColor = config.c_color;
      } else if (value >= 70) {
        gradeLetter = 'C-';
        gradeColor = config.c_minus_color;
      } else if (value >= 67) {
        gradeLetter = 'D+';
        gradeColor = config.d_plus_color;
      } else if (value >= 63) {
        gradeLetter = 'D';
        gradeColor = config.d_color;
      } else if (value >= 60) {
        gradeLetter = 'D-';
        gradeColor = config.d_minus_color;
      } else {
        gradeLetter = 'F';
        gradeColor = config.f_color;
      }
  
      return { gradeLetter, gradeColor };
    }
  });
  