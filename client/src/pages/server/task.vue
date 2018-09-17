<template>
<div class="page_task">
    <div class="task_container">
        <div class="toolbar">
            <h3>控制元件</h3>
            <ul>
                <li class="interval" title="拖动元件到右侧舞台使用">
                    <span id="item-interval" data-type="timer" draggable="true" @dragstart="dragstartHandler"></span>
                    <p>定时器</p>
                </li>
                <li class="task" title="拖动元件到右侧舞台使用">
                    <span id="item-task" data-type="task" draggable="true" @dragstart="dragstartHandler"></span>
                    <p>任务</p>
                </li>
            </ul>
        </div>
        <div class="draw_panel">
            <div class="stage" @dragover="dragoverHandler" @drop="dropHandler" @dragstart="moveStartHandler"></div>
            <div class="panel">dgg</div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'pageTask',
    data() {
        return {
            dragingEls : '',
            dragData : {},
            itemId : 0,
            initData : {
                'timer' : {
                    id : 0,
                    name : '定时器名',
                    type : 'timer',
                    x : 0,
                    y : 0
                },
                'task' : {
                    id : 0,
                    name : '任务名',
                    type : 'task',
                    x : 0,
                    y : 0
                }
            }
        }
    },
    methods: {
        dragstartHandler(e) {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", JSON.stringify(this.initData[e.target.dataset.type]));
        },
        dragoverHandler(e) {
            e.preventDefault();
        },
        dropHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            const stage = document.querySelector('.stage');
            let stagePos = stage.getBoundingClientRect();
            let data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if(e.dataTransfer.effectAllowed == 'copy') {
                data.x = e.clientX - stagePos.x;
                data.y = e.clientY - stagePos.y;
                data.id = 'item_' + (++this.itemId);
                this.dragData[data.id] = data;
                stage.innerHTML += this.createTaskItem(data);
            }else {
                this.dragData[data.id].x = e.clientX - stagePos.x;
                this.dragData[data.id].y = e.clientY - stagePos.y;
                let item = stage.querySelector('div#'+data.id);
                item.setAttribute('style', `left:${e.clientX - stagePos.x-40}px;top:${e.clientY - stagePos.y-20}px`);
            }
        },
        createTaskItem(options) {
            let htmlStr = `<div class="drag_item" id="${options.id}" style="left:${options.x-40}px;top:${options.y-20}px" draggable="true">
            <span class="${options.type}"></span><p>${options.name}</p></div>`;
            return htmlStr;
        },
        moveStartHandler(e) {
            e.dataTransfer.setData('text/plain', JSON.stringify(this.dragData[e.target.id]));
        }
    },
    mounted() {

    }
}
</script>

<style>
.page_task{
    .task_container{
        width:100%;
        overflow: hidden;
        background-color: #fafafa;
        border: solid 1px #e0e0e0;
    }
    .toolbar{
        float: left;
        width: 100px;
        text-align: center;
    }
    .toolbar h3{
        padding: 10px 0;
    }
    .toolbar ul{}
    .toolbar li{margin-top: 20px;}
    .toolbar li span,.drag_item span{width:32px;height:32px;display: block;margin:0 auto;}
    .toolbar .interval span,.drag_item .timer{
        background:url('../../assets/img/task-clock.png') no-repeat
    }
    .toolbar .task span,.drag_item .task{
        background:url('../../assets/img/task-box.png') no-repeat
    }
    .draw_panel{
        margin-left:100px;
        border-left:solid 1px #e0e0e0;
    }
    .draw_panel .stage{
        position: relative;
        height: 400px;
        background-color: #ffffff;
        border-bottom:solid 1px #e0e0e0;
    }
    .drag_item{
        position: absolute;
        width:80px;
        height:40px;
        text-align: center;
    }

}
</style>
