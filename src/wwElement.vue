<template>
  <div class="ph-scale">
    <div class="ph-title">
      pH
      <span class="info-tooltip" title="3.5 to 5.5 - acidic | 6 to 7 - optimal | 7.5 to 9 - alkaline">ℹ️</span>
    </div>
    <div class="ph-row">
      <template v-for="(item, index) in phItems" :key="item.value">
        <div
          class="ph-cell"
          :style="{ backgroundColor: item.color }"
          :class="{
            'selected': isItemInRange(item.value.toString()),
            'unselected': selectedItems.length > 0 && !isItemInRange(item.value.toString())
          }"
          @click="selectPH(item.value)"
        >
          {{ item.value }}
        </div>
        <div
          v-if="index < phItems.length - 1"
          class="ph-gap"
          :class="{ 'gap-selected': selectedItems.includes((item.value + 0.5).toString()) }"
          @click="selectHalf(item.value)"
        >
        </div>
      </template>
    </div>

    <div v-if="content?.showOutput" class="output" @click="resetSelection" :class="{ invisible: !selectedValue }">
      <span v-if="selectedValue">Selected pH: {{ selectedValue }}</span>
      <span v-else>&nbsp;</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, reactive } from 'vue'

export default {
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },

  setup(props, { emit }) {
    const selectedItems = ref([])

    const phItems = reactive([
      { value: 0, color: '#da1325' },
      { value: 1, color: '#f85516' },
      { value: 2, color: '#ffb700' },
      { value: 3, color: '#f5e31a' },
      { value: 4, color: '#cad633' },
      { value: 5, color: '#82ce30' },
      { value: 6, color: '#46b146' },
      { value: 7, color: '#079a22' },
      { value: 8, color: '#00be7e' },
      { value: 9, color: '#46cfc0' },
      { value: 10, color: '#4691cc' },
      { value: 11, color: '#3256ac' },
      { value: 12, color: '#4d4eab' },
      { value: 13, color: '#552ead' },
      { value: 14, color: '#3d2c8f' }
    ])

    const selectedValue = computed(() => {
      if (selectedItems.value.length === 0) return ''
      if (selectedItems.value.length === 1) return selectedItems.value[0]
      const sorted = [...selectedItems.value].sort((a, b) => parseFloat(a) - parseFloat(b))
      return `${sorted[0]}-${sorted[sorted.length - 1]}`
    })

    const { value: internalValue, setValue: setInternalValue } = wwLib?.wwVariable?.useComponentVariable({
      uid: props.uid,
      name: 'selectedValue',
      type: 'string',
      defaultValue: '',
    }) || { value: ref(''), setValue: () => {} }

    const selectPH = (value) => {
      const valueStr = value.toString()
      const index = selectedItems.value.indexOf(valueStr)

      if (index > -1) {
        selectedItems.value.splice(index, 1)
      } else {
        selectedItems.value.push(valueStr)
      }

      setInternalValue(selectedValue.value)
      if (emit) {
        emit('trigger-event', {
          name: 'ph-selected',
          event: { value: selectedValue.value }
        })
      }
    }

    const resetSelection = () => {
      selectedItems.value = []
      setInternalValue('')
      if (emit) {
        emit('trigger-event', {
          name: 'selection-reset',
          event: { value: '' }
        })
      }
    }

    const selectHalf = (value) => {
      const halfValue = (value + 0.5).toString()
      const index = selectedItems.value.indexOf(halfValue)

      if (index > -1) {
        selectedItems.value.splice(index, 1)
      } else {
        selectedItems.value.push(halfValue)
      }

      setInternalValue(selectedValue.value)
      if (emit) {
        emit('trigger-event', {
          name: 'ph-selected',
          event: { value: selectedValue.value }
        })
      }
    }

    const isItemInRange = (itemId) => {
      if (selectedItems.value.length === 0) return false
      if (selectedItems.value.length === 1) {
        return selectedItems.value.includes(itemId)
      }

      // For multiple selections, show range between min and max
      const selectedNumbers = selectedItems.value.map(id => parseFloat(id)).sort((a, b) => a - b)
      const minSelected = selectedNumbers[0]
      const maxSelected = selectedNumbers[selectedNumbers.length - 1]
      const currentNumber = parseFloat(itemId)

      return currentNumber >= minSelected && currentNumber <= maxSelected
    }


    // MANDATORY: Watch for ALL property changes for real-time reactivity
    watch(() => props.content?.initialValue, (newInitialValue, oldInitialValue) => {
      // Handle initialValue changes
      if (newInitialValue !== undefined && newInitialValue !== oldInitialValue) {
        selectedItems.value = newInitialValue ? [newInitialValue] : []
        setInternalValue(newInitialValue || '')
      }
    }, { immediate: true })

    return {
      phItems,
      selectedItems,
      selectedValue,
      selectPH,
      resetSelection,
      selectHalf,
      isItemInRange
    }
  }
}
</script>

<style scoped>
.ph-scale {
  width: 100%;
  max-width: fit-content;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.ph-scale::-webkit-scrollbar {
  height: 6px;
}

.ph-scale::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.ph-scale::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.ph-scale::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.ph-row {
  display: flex;
  background: white;
  min-width: max-content;
  padding: 0 10px;
}

.ph-cell {
  width: 45px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 11px;
  color: black;
  border: none;
  cursor: pointer;
  user-select: none;
  margin-right: 8px;
  touch-action: manipulation;
  transition: transform 0.1s ease;
  position: relative;
}

.info-tooltip {
  display: inline-block;
  margin-left: 10px;
  cursor: help;
  font-size: 18px;
  vertical-align: middle;
  position: relative;
  color: #007aff;
}

.info-tooltip:hover {
  color: #0056b3;
}

.ph-cell:active {
  transform: scale(0.95);
}

.ph-cell:last-child {
  margin-right: 0;
}

.ph-cell.selected {
}

.ph-cell.unselected {
  filter: grayscale(100%) brightness(0.7);
}

.output {
  margin-top: 10px;
  padding: 8px 12px;
  text-align: center;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  min-width: 150px;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.output.invisible {
  visibility: hidden;
}

.ph-gap {
  width: 8px;
  height: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  touch-action: manipulation;
}

.ph-title {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
}

/* Mobile and Tablet Grid Layout - 3 rows x 5 columns */
@media (max-width: 1024px) {
  .ph-scale {
    padding: 0 10px;
  }

  /* Transform row into grid */
  .ph-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 8px;
    padding: 0;
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
    min-width: auto;
  }

  /* Hide all gaps in grid layout */
  .ph-gap {
    display: none;
  }

  .ph-cell {
    width: 100% !important;
    height: 50px !important;
    font-size: 14px !important;
    margin-right: 0 !important;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    min-height: auto !important;
    min-width: auto !important;
  }

  .ph-cell:active {
    transform: scale(0.95);
  }

  .ph-cell.selected {
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3), 0 2px 8px rgba(0,0,0,0.2);
  }

  .ph-cell.unselected {
    filter: grayscale(100%) brightness(0.7);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .ph-title {
    font-size: 20px;
    margin-bottom: 15px;
  }

  /* Make info tooltip more tappable on mobile */
  .info-tooltip {
    padding: 8px;
    margin: 0 6px;
    font-size: 20px;
  }

  .output {
    font-size: 14px;
    padding: 0;
    max-width: 350px;
    width: 100%;
    margin: 15px auto 0;
    background: transparent;
    border: none;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }

  .output span {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-weight: bold;
    font-size: 14px;
    grid-column: 1 / -1;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
}

/* Small Mobile Devices */
@media (max-width: 480px) {
  .ph-scale {
    padding: 0 5px;
  }

  .ph-row {
    gap: 6px;
    max-width: 320px;
  }

  .ph-cell {
    height: 44px !important;
    font-size: 13px !important;
    border-radius: 4px;
  }

  .ph-title {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .output {
    max-width: 320px;
    gap: 6px;
    margin-top: 12px;
  }

  .output span {
    height: 44px;
    font-size: 13px;
  }
}

/* Large Mobile Landscape - maintain grid layout */
@media (max-width: 1024px) and (orientation: landscape) {
  .ph-row {
    max-width: 420px;
    gap: 10px;
  }

  .ph-cell {
    height: 45px !important;
    font-size: 14px !important;
  }

  .ph-title {
    font-size: 19px;
    margin-bottom: 12px;
  }
}

/* Desktop layout - restore linear layout */
@media (min-width: 1025px) {
  .ph-scale {
    padding: 0;
  }

  .ph-row {
    display: flex !important;
    grid-template-columns: none !important;
    grid-template-rows: none !important;
    gap: 0 !important;
    padding: 0 10px !important;
    min-width: max-content !important;
    max-width: fit-content !important;
    margin: 0 auto !important;
    background: white !important;
  }

  .ph-gap {
    display: flex !important;
    width: 8px !important;
    height: 25px !important;
    cursor: pointer !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
  }

  .ph-cell {
    width: 45px !important;
    height: 25px !important;
    font-size: 11px !important;
    margin-right: 8px !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    user-select: none !important;
    touch-action: manipulation !important;
    transition: transform 0.1s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-weight: bold !important;
    color: black !important;
    border: none !important;
    cursor: pointer !important;
  }

  .ph-cell:last-child {
    margin-right: 0 !important;
  }

  .ph-cell:active {
    transform: scale(0.95) !important;
  }

  .ph-cell.unselected {
    filter: grayscale(100%) brightness(0.7) !important;
  }

  .ph-title {
    font-size: 20px !important;
    margin-bottom: 15px !important;
  }

  .ph-scale .output {
    display: block !important;
    grid-template-columns: none !important;
    grid-template-rows: none !important;
    gap: 0 !important;
    max-width: 200px !important;
    width: auto !important;
    margin: 8px auto 0 !important;
    padding: 6px 8px !important;
    background: #f5f5f5 !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    text-align: center !important;
    min-width: 120px !important;
    font-size: 10px !important;
  }

  .ph-scale .output span {
    display: inline !important;
    height: auto !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    font-size: 10px !important;
    font-weight: normal !important;
    grid-column: auto !important;
    flex: none !important;
    align-items: normal !important;
    justify-content: normal !important;
  }
}

/* Ensure minimum touch target size on desktop only */
@media (pointer: coarse) and (min-width: 1025px) {
  .ph-cell,
  .ph-gap {
    min-width: 44px;
    min-height: 44px;
  }
}

</style>