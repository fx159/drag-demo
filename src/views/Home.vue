<script setup lang='ts'>
import { ref, shallowRef } from 'vue'
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue'
import CustomButton from '@/components/CustomButton.vue'
import CustomText from '@/components/CustomText.vue'
import { getStyleNumber } from '@/utils/index'

const point = ref(['t', 'l', 'r', 'b', 'lt', 'rt', 'lb', 'rb'])
const cursor: Record<string, string> = {
  t: 'n-resize',
  l: 'w-resize',
  r: 'e-resize',
  b: 's-resize',
  lt: 'nw-resize',
  rt: 'ne-resize',
  lb: 'sw-resize',
  rb: 'se-resize',
}
const openDropdown = ref(false)
const componentData = shallowRef([{
  component: CustomButton,
  props: {},
  size: 20,
  name: 'button',
  style: {
    width: '100px',
    height: '30px',
  },
}, {
  component: CustomText,
  props: {},
  size: 20,
  name: 'wenben',
  style: {
    width: '100px',
    height: '30px',
  },
}])

function generatedId() {
  return Math.floor(Math.random() * 10000000)
}

const editor = ref<HTMLElement>()

function handleDragStart(e: DragEvent) {
  e.dataTransfer!.setData('index', (e.target as any).dataset.index)
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'
}

const selectComponent = shallowRef()
const componentList = ref<any>([])

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  const rectInfo = editor.value!.getBoundingClientRect()

  if (e.dataTransfer?.getData('index')) {
    const select: any = componentData.value[+e.dataTransfer.getData('index')]
    select.style = {
      ...select.style,
      top: `${e.clientY - rectInfo.y - 15}px`,
      left: `${e.clientX - rectInfo.x - 15}px`,
    }
    componentList.value.push({ ...select, id: generatedId(), component: shallowRef(select.component) })
  }
}

function handleParentMouseDown(e: MouseEvent) {
  e.stopPropagation()
}

function handleMouseDown(e: MouseEvent, index: number) {
  e.stopPropagation()
  const rectInfo = editor.value?.getBoundingClientRect()

  let isFirst = true
  // const height = getStyleNumber(componentList.value[index].style.height)
  const move = (mouseEvent: MouseEvent) => {
    if (isFirst) {
      isFirst = false
      return
    }
    componentList.value[index].style.left = mouseEvent.clientX - rectInfo!.left > 0 ? `${mouseEvent.clientX - rectInfo!.left - e.offsetX}px` : 0
    componentList.value[index].style.top = mouseEvent.clientY - rectInfo!.top > 0 ? `${mouseEvent.clientY - rectInfo!.top - e.offsetY}px` : '-4px'
  }
  const mouseUp = () => {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', mouseUp)
  }
  document.addEventListener('mouseup', mouseUp)
  document.addEventListener('mousemove', move)
}

function getPointStyle(point: string, { width, height }: any) {
  const nWidth = getStyleNumber(width)
  const nHeight = getStyleNumber(height)
  const hasT = /t/.test(point)
  const hasB = /b/.test(point)
  const hasL = /l/.test(point)
  const hasR = /r/.test(point)
  let newLeft = 0
  let newTop = 0
  if (point.length === 2) {
    newLeft = hasL ? 0 : nWidth
    newTop = hasT ? 0 : nHeight
  }
  else {
    if (hasT || hasB) {
      newLeft = nWidth / 2
      newTop = hasT ? 0 : nHeight
    }
    if (hasL || hasR) {
      newLeft = hasL ? 0 : nWidth
      newTop = Math.floor(nHeight / 2)
    }
  }

  return {
    left: `${newLeft}px`,
    top: `${newTop}px`,
    marginLeft: '-4px',
    marginTop: '-4px',
    cursor: cursor[point],
  }
}

// 放大操作
function handleShapeMouseDown(e: MouseEvent, point: string) {
  e.preventDefault()
  e.stopPropagation()
  const height = getStyleNumber(selectComponent.value.style.height)
  const width = getStyleNumber(selectComponent.value.style.width)
  const left = getStyleNumber(selectComponent.value.style.left)
  const top = getStyleNumber(selectComponent.value.style.top)
  const startY = e.y
  const startX = e.x

  let fn: any
  switch (point) {
    case 'b':
      fn = function (mouseEvent: MouseEvent) {
        selectComponent.value.style.height = `${height + mouseEvent.y - startY}px`
      }
      break
    case 'l':
      fn = function (mouseEvent: MouseEvent) {
        selectComponent.value.style.width = `${width - (mouseEvent.x - startX)}px`
        selectComponent.value.style.left = `${left + (mouseEvent.x - startX)}px`
      }
      break
    case 'r':
      fn = function (mouseEvent: MouseEvent) {
        selectComponent.value.style.width = `${width + (mouseEvent.x - startX)}px`
      }
      break
    case 't':
      fn = function (mouseEvent: MouseEvent) {
        selectComponent.value.style.height = `${height - (mouseEvent.y - startY)}px`
        selectComponent.value.style.top = `${top + (mouseEvent.y - startY)}px`
      }
      break
    case 'lt':
      fn = function (mouseEvent: MouseEvent) {
        selectComponent.value.style.height = `${height - (mouseEvent.y - startY)}px`
        selectComponent.value.style.top = `${top + (mouseEvent.y - startY)}px`
        selectComponent.value.style.width = `${width - (mouseEvent.x - startX)}px`
        selectComponent.value.style.left = `${left + (mouseEvent.x - startX)}px`
      }
      break
    case 'lb':
      fn = function (mouseEvent: MouseEvent) {
        selectComponent.value.style.width = `${width - (mouseEvent.x - startX)}px`
        selectComponent.value.style.left = `${left + (mouseEvent.x - startX)}px`
        selectComponent.value.style.height = `${height + mouseEvent.y - startY}px`
      }
      break
    case 'rt':
      fn = function (mouseEvent: MouseEvent) {
        selectComponent.value.style.width = `${width + (mouseEvent.x - startX)}px`
        selectComponent.value.style.height = `${height - (mouseEvent.y - startY)}px`
        selectComponent.value.style.top = `${top + (mouseEvent.y - startY)}px`
      }
      break
    case 'rb':
      fn = function (mouseEvent: MouseEvent) {
        selectComponent.value.style.width = `${width + (mouseEvent.x - startX)}px`
        selectComponent.value.style.height = `${height + mouseEvent.y - startY}px`
      }
      break
  }
  const up = function () {
    document.removeEventListener('mousemove', fn)
    document.removeEventListener('mouseup', up)
  }
  document.addEventListener('mousemove', fn)
  document.addEventListener('mouseup', up)
}

function handleComponentClick(item: typeof componentData.value[number]) {
  selectComponent.value = item
}

function handleUnselectComponet(e: MouseEvent) {
  e.stopPropagation()
  openDropdown.value = false
  selectComponent.value = null
}

// 旋转操作
function handleComponentRotate(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
}

function handleContextMenu(e: MouseEvent, id: number) {
  e.preventDefault()
  if (!selectComponent.value || selectComponent.value.id !== id)
    return
  openDropdown.value = true
}

function handleMoveTop(index: number) {
  if (index === componentList.value.length - 1)
    return
  const temp = componentList.value[index]
  componentList.value[index] = componentList.value[index + 1]
  componentList.value[index + 1] = temp
  openDropdown.value = false
}

function handleMoveBottom(index: number) {
  if (index === 0)
    return
  const temp = componentList.value[index]
  componentList.value[index] = componentList.value[index - 1]
  componentList.value[index - 1] = temp
  openDropdown.value = false
}

function handleDeleteComponent(index: number) {
  componentList.value.splice(index, 1)
  openDropdown.value = false
}

function handleStickTop(index: number) {
  const temp = componentList.value[index]
  componentList.value[index] = componentList.value[componentList.value.length - 1]
  componentList.value[componentList.value.length - 1] = temp
  openDropdown.value = false
}

function handleStickBottom(index: number) {
  const temp = componentList.value[index]
  componentList.value[index] = componentList.value[0]
  componentList.value[0] = temp
  openDropdown.value = false
}
</script>

<template>
  <div class="flex p-5 page items-center">
    <div class="left px-5 flex-1 h-full border-solid border flex flex-wrap" @dragstart="handleDragStart">
      <div v-for="(item, index) in componentData" :key="index" class="cursor h-40 mr-10" :draggable="true" :data-index="index">
        <span class="iconfont" :class="`icon-${item.name}`" />
        <!-- <CustomText /> -->
      </div>
    </div>
    <div
      ref="editor" class="container w-350 h-750 mx-20 border-solid border relative z-10" @dragover="handleDragOver" @drop="handleDrop"
      @click="handleUnselectComponet" @mousedown="handleParentMouseDown"
    >
      <div
        v-for="(component, index) in componentList"
        :key="component.id" class="absolute"
        :style="{ ...component.style, zIndex: index }"
        @click.stop="handleComponentClick(component)" @mousedown="e => handleMouseDown(e, index)"
        @contextmenu.stop="e => handleContextMenu(e, component.id)"
      >
        <div :class="[selectComponent && selectComponent.id === component.id ? 'shape-active' : 'shape']">
          <span class="iconfont icon-xiangzuoxuanzhuan" @mousedown.stop="handleComponentRotate" />
          <div
            v-for="(item, i) in point" :key="i" class="shape-point"
            :style="getPointStyle(item, component.style)" @mousedown="e => handleShapeMouseDown(e, item)"
          />
        </div>
        <ADropdown v-if="selectComponent && selectComponent.id === component.id" v-model:open="openDropdown" trigger="contextmenu" placement="bottomRight">
          <template #overlay>
            <AMenu>
              <AMenuItem>
                <a @click.stop="handleMoveTop(index)">上移</a>
              </AMenuItem>
              <AMenuItem>
                <a @click.stop="handleMoveBottom(index)">下移</a>
              </AMenuItem>
              <AMenuItem>
                <a @click.stop="handleStickTop(index)">置顶</a>
              </AMenuItem>
              <AMenuItem>
                <a @click.stop="handleStickBottom(index)">置底</a>
              </AMenuItem>
              <AMenuItem>
                <a @click.stop="handleDeleteComponent(index)">删除</a>
              </AMenuItem>
            </AMenu>
          </template>
        </ADropdown>
        <component :is="component.component" style="width:100%;height:100%" />
      </div>
    </div>
    <div class="right flex-1 border border-solid h-full">
      right
    </div>
  </div>
</template>

<style scoped lang="less">
.page {
  height: 100vh;
}

.left {
  ::v-deep(.van-badge__wrapper) {
    z-index: 0 !important;
    position: relative;
  }
}

.cursor {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.iconfont {
  font-size: 30px;
}

.shape {
  display: none;

  &-active {

    display: block;
  }
}

.shape-point {
  position: absolute;
  background: #fff;
  border: 1px solid #59c7f9;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  z-index: 1;
}
.icon-xiangzuoxuanzhuan{
    position: absolute;
    top: -34px;
    left: 50%;
    transform: translateX(-50%);
    cursor: grab;
    color: #59c7f9;
    font-size: 20px;
    font-weight: 600;

    &:active {
        cursor: grabbing;
    }
}
</style>
