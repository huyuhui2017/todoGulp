;(function(){
    var $add_task=$(".add-task"),
        $task_list=$(".task-list"),
        task_list=[];  //列表
    init();

    $add_task.on('submit',function (ev) {
        ev.preventDefault();   //取消默认事件

        var obj={};
        obj.content=$add_task.find(".text").val();

        if (!obj.content) return;

        add_task_list(obj);  //添加数据
        $add_task.find(".text").val(null);

        renew_html()
    });

    //初始化
    function init() {
        task_list=store.get('task') || [];
        renew_html();
    }

    //把数据推到浏览器
    function add_task_list(obj) {
        task_list.push(obj);
        store.set('task',task_list);    //把数据存进来
    }

    //跟新html列表
    function renew_html() {
        $task_list.html(null);

        var is_complateArr=[];

        for(var i=0;i<task_list.length;i++)
        {
            if (task_list[i].complate)
            {
                is_complateArr[i]=task_list[i];
            }
            else
            {
                var $item=create_html(i,task_list[i]);
                $task_list.prepend($item);
            }
        }

        for(var j=0;j<task_list.length;j++)
        {
            var $item01=create_html(j,is_complateArr[j]);
            $task_list.append($item01);
            if (!$item01) continue;
            $item01.addClass("unline");
        }

        var $delete=$(".delete.r-main");
        var $complate=$(".task-list .complate");
        delete_event($delete);   //删除事件
        deteal_event();   //详细事件
        is_complate($complate);    //选中事件
        time_remind();  //闹钟
    }
    //生成html
    function create_html(index,data) {
        if (!data) return;
        var str='<li data-index="'+index+'">'+
            '<input type="checkbox" '+(data.complate?"checked":"")+' class="complate">'+
            '<p class="content">'+data.content+'</p>'+
            '<div class="right">'+
            '<span class="delete r-main">删除</span>'+
            '<span class="deteal r-main">详细</span>'+
            '</div>'+
            '</li>';

        return $(str);
    }

    /**********************删除事件*************************/
    function delete_event($delete) {
        $delete.on("click",function () {
            var index=$(this).parent().parent().data("index");
            delete_alert(index);  //弹框
        })
    }

    //显示弹框
    function delete_alert(index) {
        $(".Alert").show();
        console.log(index);
        $(".primary.confirm").bind('click',function () {
            task_list.splice(index,1);
            console.log(index);
            $(".Alert").hide();
            delete_up_data();
            renew_html();
            $(".primary.confirm").unbind('click');
        });
        $(".cancel").click(function () {
            $(".Alert").hide();
        })

        /*var off=confirm("你确定删除吗");
        if (!off) return;*/

    }

    //更新数据
    function delete_up_data() {
        store.set("task",task_list)
    }

    /**********************详细事件*************************/
    function deteal_event() {
        $(".deteal.r-main").on("click",function () {
            var index=$(this).parent().parent().data("index");
            var $item=deteal_create_html(task_list[index]); //html
            $task_list.after($item);   //生成html

            up_detail_data(index);   //详细列表   提交数据
            db_click();        //双击事件
            datetimepicker(); //日期插件

            $(".task-detail-mask,.close").click(function () {
                $(".task-detail").remove();  //删除html
                $(".task-detail-mask").remove();    //删除html
            })
        })
    }

    //生成详细弹框
    function deteal_create_html(data) {
        var str='<div class="task-detail-mask"></div>'+
                '<div class="task-detail">'+
                '<form class="up-task">'+
                '<h2 class="content">'+data.content+'</h2>'+
                '<div class="input-item">'+
                '<input type="text" id="dbText">'+
                '</div>'+
                '<div class="input-item">'+
                '<textarea>'+(data.dsk||"")+'</textarea>'+
                '</div>'+
                '<div class="remind input-item">'+
                '<label for="b">提醒时间</label>'+
                '<input id="b" class="datetime" type="text" value="'+(data.time||"")+'">'+
                '</div>'+
                '<div class="input-item">'+
                '<button>更新</button>'+
                '</div>'+
                '<div class="close">✘</div>'+
                '</form>'+
                '</div>';

        return $(str);
    }

    //双击事件
    function db_click() {
        $(".task-detail .up-task .content").dblclick(function () {
            var $dbText=$("#dbText");
            var $that=$(this);
            $that.hide();
            $dbText.show();
            $dbText.focus();

            $dbText.blur(function () {
                $dbText.hide();
                $that.show();
                if (!$dbText.val())
                    return
                else
                    $that.text($dbText.val())
            })
        })
    }

    //详细列表   提交数据
    function up_detail_data(index) {
        var $upTask=$('.task-detail .up-task');
        $upTask.on("submit",function (ev) {
            ev.preventDefault();

            var newObj={};
            newObj.content=$upTask.find(".content").text();
            newObj.dsk=$upTask.find(".input-item textarea").val();
            newObj.time=$upTask.find(".remind .datetime").val();

            up_data(newObj,index);
        })
    }

    function up_data(newObj,index) {
        task_list[index]=$.extend({},task_list[index],newObj);

        store.set("task",task_list);
        renew_html();   //更新
    }

    //选中事件
    function is_complate($complate) {
        $complate.on("click",function () {
            //在数据里添加 complate
            var index=$(this).parent().data("index");
            if(task_list[index].complate)
            {
                up_data({complate:false},index)
            }
            else
            {
                up_data({complate:true},index)
            }
        })
    }

    //日期插件
    function datetimepicker(){
        $.datetimepicker.setLocale('ch');//设置中文
        $('.datetime').datetimepicker({
            yearStart:2016,     //设置最小年份
            yearEnd:2018,        //设置最大年份
        });
    }
    time_remind();
    //时间提醒
    function time_remind() {
        //获取最新时间   cur_time
        //获取结束时间   end_time
        //时间到了播放音乐
        var timer=null;
        timer=setInterval(function () {
            var cur_time=new Date().getTime();

            for(var i=0;i<task_list.length;i++)
            {
                if(!task_list[i].time||task_list[i].complate|| task_list[i].off) continue;
                var end_time=(new Date(task_list[i].time)).getTime();

                if (end_time - cur_time < 1)
                {
                    /*console.log(1);*/
                    //弹出提示框
                    msg_show(task_list[i].content);

                    up_data({off:true},i);
                    clearInterval(timer);
                    //播放music
                    play_music();
                }
            }
        },1000)
    }

    //播放音乐
    function play_music() {
        var music=document.querySelector("#music")
        // console.log(music);
        music.play();
        /*$(".msg-btn").click(function () {
            music.pause();
        })*/
    }

    //提示框
    function msg_show(content) {
        $(".msg").show();
        $(".msg-content").text(content);
        $(".msg-btn").click(function () {
            $(".msg").hide();
        });
        time_remind();
    }

    // store.clear();
}());
/**
 * Created by Administrator on 2017/6/8.
 */
