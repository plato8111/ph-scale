<template>
  <div class="ph-scale">
    <div class="labels-row">
      <div class="top-line"></div>
      <div class="ph-title">pH</div>
      <div class="label-group acidic">
        <div class="label-text">acidic</div>
        <div class="label-line"></div>
      </div>
      <div class="label-group optimal">
        <div class="label-text">optimal</div>
        <div class="label-line"></div>
      </div>
      <div class="label-group alkaline">
        <div class="label-text">alkaline</div>
        <div class="label-line"></div>
      </div>
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
import { ref, computed, watch } from 'vue'

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

    const phItems = [
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
    ]

    const selectedValue = computed(() => {
      if (selectedItems.value.length === 0) return ''
      if (selectedItems.value.length === 1) return selectedItems.value[0]
      const sorted = [...selectedItems.value].sort((a, b) => parseFloat(a) - parseFloat(b))
      return `${sorted[0]}-${sorted[sorted.length - 1]}`
    })

    const { value: internalValue, setValue: setInternalValue } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedValue',
      type: 'string',
      defaultValue: '',
    })

    const selectPH = (value) => {
      const valueStr = value.toString()
      const index = selectedItems.value.indexOf(valueStr)

      if (index > -1) {
        selectedItems.value.splice(index, 1)
      } else {
        selectedItems.value.push(valueStr)
      }

      setInternalValue(selectedValue.value)
      emit('trigger-event', {
        name: 'ph-selected',
        event: { value: selectedValue.value }
      })
    }

    const resetSelection = () => {
      selectedItems.value = []
      setInternalValue('')
      emit('trigger-event', {
        name: 'selection-reset',
        event: { value: '' }
      })
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
      emit('trigger-event', {
        name: 'ph-selected',
        event: { value: selectedValue.value }
      })
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
    watch(() => [
      props.content?.initialValue,
      props.content?.showOutput,
      // All other content properties that affect component rendering
    ], ([newInitialValue], [oldInitialValue]) => {
      // Handle initialValue changes
      if (newInitialValue !== undefined && newInitialValue !== oldInitialValue) {
        selectedItems.value = newInitialValue ? [newInitialValue] : []
        setInternalValue(newInitialValue || '')
      }
      // Other properties are handled by computed styles automatically
    }, { immediate: true, deep: true })

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

.labels-row {
  position: relative;
  width: 100%;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  height: 20px;
  min-width: max-content;
  padding: 0 10px;
}

.label-group {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label-text {
  font-weight: 500;
  text-transform: lowercase;
  white-space: nowrap;
  margin-bottom: 2px;
}

.label-line {
  height: 2px;
  background-color: #666;
}

.label-group.acidic {
  left: 33.3%;
  transform: translateX(-50%);
}

.label-group.acidic .label-line {
  width: 120px;
}

.label-group.optimal {
  left: 46.7%;
  transform: translateX(-50%);
}

.label-group.optimal .label-line {
  width: 100px;
}

.label-group.alkaline {
  left: 60%;
  transform: translateX(-50%);
}

.label-group.alkaline .label-line {
  width: 110px;
}

.top-line {
  position: absolute;
  top: -5px;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #666;
}

.ph-title {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  font-size: 20px;
  color: #333;
}

/* Mobile and Tablet Responsive Design */
@media (max-width: 768px) {
  .ph-scale {
    padding: 0 8px;
  }

  .ph-row {
    padding: 0 4px;
  }

  .ph-cell {
    width: 38px;
    height: 32px;
    font-size: 10px;
    margin-right: 6px;
    min-height: 44px;
    min-width: 44px;
  }

  .ph-gap {
    width: 6px;
    height: 32px;
    min-height: 44px;
  }

  .labels-row {
    padding: 0 4px;
    font-size: 12px;
  }

  .ph-title {
    font-size: 18px;
    top: -28px;
  }

  .output {
    font-size: 11px;
    padding: 6px 10px;
    max-width: 95%;
  }

  .label-group.acidic .label-line {
    width: 100px;
  }

  .label-group.optimal .label-line {
    width: 80px;
  }

  .label-group.alkaline .label-line {
    width: 90px;
  }
}

/* Small Mobile Devices */
@media (max-width: 480px) {
  .ph-scale {
    padding: 0 4px;
  }

  .ph-row {
    padding: 0 2px;
  }

  .ph-cell {
    width: 32px;
    height: 36px;
    font-size: 9px;
    margin-right: 4px;
    min-height: 44px;
    min-width: 44px;
  }

  .ph-gap {
    width: 4px;
    height: 36px;
    min-height: 44px;
  }

  .labels-row {
    padding: 0 2px;
    font-size: 11px;
    margin-bottom: 6px;
  }

  .ph-title {
    font-size: 16px;
    top: -26px;
  }

  .output {
    font-size: 10px;
    padding: 5px 8px;
    margin-top: 8px;
  }

  .label-text {
    font-size: 10px;
  }

  .label-group.acidic .label-line {
    width: 80px;
  }

  .label-group.optimal .label-line {
    width: 60px;
  }

  .label-group.alkaline .label-line {
    width: 70px;
  }
}

/* Large Mobile Landscape */
@media (max-width: 768px) and (orientation: landscape) {
  .ph-cell {
    width: 42px;
    height: 28px;
    font-size: 10px;
    margin-right: 7px;
  }

  .ph-gap {
    width: 7px;
    height: 28px;
  }

  .ph-title {
    font-size: 17px;
    top: -27px;
  }
}

/* Ensure minimum touch target size on all devices */
@media (pointer: coarse) {
  .ph-cell,
  .ph-gap {
    min-width: 44px;
    min-height: 44px;
  }
}

</style>