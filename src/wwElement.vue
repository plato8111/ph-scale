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

    watch(() => props.content?.initialValue, (newValue, oldValue) => {
      if (newValue !== undefined && newValue !== oldValue) {
        selectedItems.value = newValue ? [newValue] : []
        setInternalValue(newValue || '')
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
  width: fit-content;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ph-row {
  display: flex;
  background: white;
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
  padding: 5px;
  text-align: center;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 10px;
  width: 150px;
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
}

.labels-row {
  position: relative;
  width: 100%;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  height: 20px;
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

</style>