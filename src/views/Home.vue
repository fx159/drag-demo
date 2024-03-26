<script setup lang='ts'>
import { ref, shallowRef } from 'vue'
import { Button as AButton, Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue'
import { cloneDeep } from 'lodash'
import CustomButton from '@/components/CustomButton.vue'
import CustomText from '@/components/CustomText.vue'
import { calculateRotatedPointCoordinate, getCenterPoint, getStyleNumber } from '@/utils/index'

const point = ref(['t', 'l', 'r', 'b', 'lt', 'rt', 'lb', 'rb'])
const componentRefs = ref<HTMLElement[]>([])
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
    rotate: '0deg',
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
    const select: any = cloneDeep(componentData.value[+e.dataTransfer.getData('index')])
    select.style = {
      ...select.style,
      top: `${e.clientY - rectInfo.y - 15}px`,
      left: `${e.clientX - rectInfo.x - 15}px`,
    }
    componentList.value.push({ ...select, id: generatedId(), component: shallowRef(select.component) })
  }
}

function handleMouseDown(e: MouseEvent, item: typeof componentData.value[number]) {
  e.stopPropagation()
  selectComponent.value = item
  const rectInfo = editor.value?.getBoundingClientRect()
  let isFirst = true
  // const height = getStyleNumber(componentList.value[index].style.height)
  const move = (mouseEvent: MouseEvent) => {
    if (isFirst) {
      isFirst = false
      return
    }
    selectComponent.value.style.left = mouseEvent.clientX - rectInfo!.left > 0 ? `${mouseEvent.clientX - rectInfo!.left - e.offsetX}px` : 0
    selectComponent.value.style.top = mouseEvent.clientY - rectInfo!.top > 0 ? `${mouseEvent.clientY - rectInfo!.top - e.offsetY}px` : '-4px'
  }
  const mouseUp = () => {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', mouseUp)
  }
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', mouseUp)
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
  // 当前组件中心点坐标
  const center = {
    x: left + width / 2,
    y: top + height / 2,
  }

  // 缩放后对称中心点坐标
  const editorRectinfo = editor.value!.getBoundingClientRect()
  const curPoint = {
    x: e.clientX - editorRectinfo.left,
    y: e.clientY - editorRectinfo.top,
  }

  const symmetricPoint = {
    x: center.x - curPoint.x + center.x,
    y: center.y - curPoint.y + center.y,
  }
  const rotate = +selectComponent.value.style.rotate.slice(0, selectComponent.value.style.rotate.length - 3)
  let fn: any
  let first = true
  switch (point) {
    case 'b':
      fn = function (mouseEvent: MouseEvent) {
        if (first) {
          first = false
          return
        }
        const curPositon = {
          x: mouseEvent.clientX - Math.round(editorRectinfo.left),
          y: mouseEvent.clientY - Math.round(editorRectinfo.top),
        }
        const rotatedcurPositon = calculateRotatedPointCoordinate(curPositon, curPoint, -rotate)
        const rotatedBottomMiddlePoint = calculateRotatedPointCoordinate({
          x: curPoint.x,
          y: rotatedcurPositon.y,
        }, curPoint, rotate)
        const newHeight = Math.sqrt((rotatedBottomMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedBottomMiddlePoint.y - symmetricPoint.y) ** 2)
        const newCenter = {
          x: rotatedBottomMiddlePoint.x - (rotatedBottomMiddlePoint.x - symmetricPoint.x) / 2,
          y: rotatedBottomMiddlePoint.y + (symmetricPoint.y - rotatedBottomMiddlePoint.y) / 2,
        }
        selectComponent.value.style.width = `${width}px`
        selectComponent.value.style.height = `${Math.round(newHeight)}px`
        selectComponent.value.style.top = `${Math.round(newCenter.y - (newHeight / 2))}px`
        selectComponent.value.style.left = `${Math.round(newCenter.x - (width / 2))}px`
      }
      break
    case 'l':
      fn = function (mouseEvent: MouseEvent) {
        if (first) {
          first = false
          return
        }
        const curPositon = {
          x: mouseEvent.clientX - Math.round(editorRectinfo.left),
          y: mouseEvent.clientY - Math.round(editorRectinfo.top),
        }
        const rotatedcurPositon = calculateRotatedPointCoordinate(curPositon, curPoint, -rotate)
        const rotatedLeftMiddlePoint = calculateRotatedPointCoordinate({
          x: rotatedcurPositon.x,
          y: curPoint.y,
        }, curPoint, rotate)
        const newWidth = Math.sqrt((rotatedLeftMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedLeftMiddlePoint.y - symmetricPoint.y) ** 2)
        const newCenter = {
          x: rotatedLeftMiddlePoint.x - (rotatedLeftMiddlePoint.x - symmetricPoint.x) / 2,
          y: rotatedLeftMiddlePoint.y + (symmetricPoint.y - rotatedLeftMiddlePoint.y) / 2,
        }
        selectComponent.value.height = `${height}px`
        selectComponent.value.width = `${Math.round(newWidth)}px`
        selectComponent.value.top = `${Math.round(newCenter.y - (height / 2))}px`
        selectComponent.value.left = `${Math.round(newCenter.x - (newWidth / 2))}px`
      }
      break
    case 'r':
      fn = function (mouseEvent: MouseEvent) {
        if (first) {
          first = false
          return
        }
        const curPositon = {
          x: mouseEvent.clientX - Math.round(editorRectinfo.left),
          y: mouseEvent.clientY - Math.round(editorRectinfo.top),
        }

        const rotatedcurPositon = calculateRotatedPointCoordinate(curPositon, curPoint, -rotate)
        const rotatedRightMiddlePoint = calculateRotatedPointCoordinate({
          x: rotatedcurPositon.x,
          y: curPoint.y,
        }, curPoint, rotate)
        const newWidth = Math.sqrt((rotatedRightMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedRightMiddlePoint.y - symmetricPoint.y) ** 2)
        const newCenter = {
          x: rotatedRightMiddlePoint.x - (rotatedRightMiddlePoint.x - symmetricPoint.x) / 2,
          y: rotatedRightMiddlePoint.y + (symmetricPoint.y - rotatedRightMiddlePoint.y) / 2,
        }
        selectComponent.value.style.height = `${height}px`
        selectComponent.value.style.width = `${Math.round(newWidth)}px`
        selectComponent.value.style.top = `${Math.round(newCenter.y - (height / 2))}px`
        selectComponent.value.style.left = `${Math.round(newCenter.x - (newWidth / 2))}px`
      }
      break
    case 't':
      fn = function (mouseEvent: MouseEvent) {
        if (first) {
          first = false
          return
        }
        const curPositon = {
          x: mouseEvent.clientX - Math.round(editorRectinfo.left),
          y: mouseEvent.clientY - Math.round(editorRectinfo.top),
        }
        const rotatedcurPositon = calculateRotatedPointCoordinate(curPositon, curPoint, -rotate)
        // 算出旋转前 y 坐标，再用 curPoint 的 x 坐标，重新计算它们旋转后对应的坐标
        const rotatedTopMiddlePoint = calculateRotatedPointCoordinate({
          x: curPoint.x,
          y: rotatedcurPositon.y,
        }, curPoint, rotate)
        // 用旋转后的坐标和对称点算出新的高度（勾股定理）
        const newHeight = Math.sqrt((rotatedTopMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedTopMiddlePoint.y - symmetricPoint.y) ** 2)
        const newCenter = {
          x: rotatedTopMiddlePoint.x - (rotatedTopMiddlePoint.x - symmetricPoint.x) / 2,
          y: rotatedTopMiddlePoint.y + (symmetricPoint.y - rotatedTopMiddlePoint.y) / 2,
        }
        selectComponent.value.style.width = `${width}px`
        selectComponent.value.style.height = `${Math.round(newHeight)}px`
        selectComponent.value.style.top = `${Math.round(newCenter.y - (newHeight / 2))}px`
        selectComponent.value.style.left = `${Math.round(newCenter.x - (width / 2))}px`
      }
      break
    case 'lt':
      fn = function (mouseEvent: MouseEvent) {
        if (first) {
          first = false
          return
        }
        const curPositon = {
          x: mouseEvent.clientX - Math.round(editorRectinfo.left),
          y: mouseEvent.clientY - Math.round(editorRectinfo.top),
        }
        const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
        const newTopLeftPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -rotate)
        const newBottomRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -rotate)
        const newWidth = newBottomRightPoint.x - newTopLeftPoint.x
        const newHeight = newBottomRightPoint.y - newTopLeftPoint.y
        if (newWidth > 0 && newHeight > 0) {
          selectComponent.value.style.width = `${Math.round(newWidth)}px`
          selectComponent.value.style.height = `${Math.round(newHeight)}px`
          selectComponent.value.style.left = `${Math.round(newTopLeftPoint.x)}px`
          selectComponent.value.style.top = `${Math.round(newTopLeftPoint.y)}px`
        }
      }
      break
    case 'lb':
      fn = function (mouseEvent: MouseEvent) {
        if (first) {
          first = false
          return
        }
        const curPositon = {
          x: mouseEvent.clientX - Math.round(editorRectinfo.left),
          y: mouseEvent.clientY - Math.round(editorRectinfo.top),
        }
        const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
        const newTopRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -rotate)
        const newBottomLeftPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -rotate)
        const newWidth = newTopRightPoint.x - newBottomLeftPoint.x
        const newHeight = newBottomLeftPoint.y - newTopRightPoint.y
        if (newWidth > 0 && newHeight > 0) {
          selectComponent.value.style.width = `${Math.round(newWidth)}px`
          selectComponent.value.style.height = `${Math.round(newHeight)}px`
          selectComponent.value.style.left = `${Math.round(newBottomLeftPoint.x)}px`
          selectComponent.value.style.top = `${Math.round(newTopRightPoint.y)}px`
        }
      }
      break
    case 'rt':
      fn = function (mouseEvent: MouseEvent) {
        if (first) {
          first = false
          return
        }
        const curPositon = {
          x: mouseEvent.clientX - Math.round(editorRectinfo.left),
          y: mouseEvent.clientY - Math.round(editorRectinfo.top),
        }
        const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
        const newTopRightPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -rotate)
        const newBottomLeftPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -rotate)
        const newWidth = newTopRightPoint.x - newBottomLeftPoint.x
        const newHeight = newBottomLeftPoint.y - newTopRightPoint.y
        if (newWidth > 0 && newHeight > 0) {
          selectComponent.value.style.width = `${Math.round(newWidth)}px`
          selectComponent.value.style.height = `${Math.round(newHeight)}px`
          selectComponent.value.style.left = `${Math.round(newBottomLeftPoint.x)}px`
          selectComponent.value.style.top = `${Math.round(newTopRightPoint.y)}px`
        }
      }
      break
    case 'rb':
      fn = function (mouseEvent: MouseEvent) {
        if (first) {
          first = false
          return
        }
        const curPositon = {
          x: mouseEvent.clientX - Math.round(editorRectinfo.left),
          y: mouseEvent.clientY - Math.round(editorRectinfo.top),
        }
        const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
        const newTopLeftPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -rotate)
        const newBottomRightPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -rotate)
        const newWidth = newBottomRightPoint.x - newTopLeftPoint.x
        const newHeight = newBottomRightPoint.y - newTopLeftPoint.y
        if (newWidth > 0 && newHeight > 0) {
          selectComponent.value.style.width = `${Math.round(newWidth)}px`
          selectComponent.value.style.height = `${Math.round(newHeight)}px`
          selectComponent.value.style.left = `${Math.round(newTopLeftPoint.x)}px`
          selectComponent.value.style.top = `${Math.round(newTopLeftPoint.y)}px`
        }
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

function handleUnselectComponet(e: MouseEvent) {
  e.stopPropagation()
  openDropdown.value = false
  selectComponent.value = null
}

// 旋转操作
function handleComponentRotate(e: MouseEvent, index: number) {
  e.preventDefault()
  e.stopPropagation()
  const rotate = +selectComponent.value.style.rotate.slice(0, selectComponent.value.style.rotate.length - 3)

  const { height, width, left, top } = componentRefs.value[index].getBoundingClientRect()
  const y = height / 2 + top
  const x = width / 2 + left
  const startX = e.clientX
  const startY = e.clientY

  const startRotate = Math.atan2(startY - y, startX - x) / (Math.PI / 180)
  let isFirst = true
  const move = (moveEvent: MouseEvent) => {
    if (isFirst) {
      isFirst = false
      return
    }
    const endRotate = Math.atan2(moveEvent.clientY - y, moveEvent.clientX - x) / (Math.PI / 180)
    selectComponent.value.style.rotate = `${Math.round(rotate + endRotate - startRotate)}deg`
  }

  const up = () => {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
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

function onExport() {
  console.log(componentList.value)
}
</script>

<template>
  <div class="flex p-5 page items-center">
    <div class="left px-5 flex-1 h-full border-solid border flex flex-wrap" @dragstart="handleDragStart">
      <div v-for="(item, index) in componentData" :key="index" class="cursor h-40 mr-10" :draggable="true" :data-index="index">
        <span class="iconfont" :class="`icon-${item.name}`" />
      </div>
    </div>
    <div
      ref="editor" class="container w-350 h-750 mx-20 border-solid border relative z-10" @dragover="handleDragOver" @drop="handleDrop"
      @click.self="handleUnselectComponet"
    >
      <div
        v-for="(component, index) in componentList"
        :key="component.id" ref="componentRefs"
        class="absolute"
        :style="{ ...component.style, zIndex: index }"
        @mousedown="e => handleMouseDown(e, component)"
        @contextmenu.stop="e => handleContextMenu(e, component.id)"
      >
        <div :class="[selectComponent && selectComponent.id === component.id ? 'shape-active' : 'shape']">
          <span class="iconfont icon-xiangzuoxuanzhuan" @mousedown.self="e => handleComponentRotate(e, index)" />
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
        <component :is="component.component" v-bind="component.props" style="width:100%;height:100%" />
      </div>
    </div>
    <div class="right flex-1 border border-solid h-full">
      <AButton @click="onExport">
        导出
      </AButton>
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
