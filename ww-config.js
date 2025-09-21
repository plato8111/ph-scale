export default {
  editor: {
    label: {
      en: "pH Scale Selector",
    },
    icon: 'wwi wwi-grid'
  },
  properties: {
    initialValue: {
      label: {
        en: "Initial pH Value",
      },
      type: "Text",
      section: "settings",
      bindable: true,
      defaultValue: "",
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'pH value (0-14) or empty for no selection'
      },
      propertyHelp: 'Set initial pH value. Use numbers 0-14 or leave empty for no selection'
      /* wwEditor:end */
    },
    showOutput: {
      label: {
        en: "Show Selected Output",
      },
      type: "OnOff",
      section: "settings",
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show/hide the selected pH output display'
      },
      propertyHelp: 'Display the selected pH value below the scale'
      /* wwEditor:end */
    }
  },
  triggerEvents: [
    {
      name: 'ph-selected',
      label: { en: 'pH Value Selected' },
      event: {
        value: ''
      },
      default: true
    },
    {
      name: 'selection-reset',
      label: { en: 'Selection Reset' },
      event: {
        value: ''
      }
    }
  ]
};