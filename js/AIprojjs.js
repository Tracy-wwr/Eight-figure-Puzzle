/**
 * Created by tracy on 15/10/5.
 */
$(document).ready(function(){

    // UI部分代码
    // make all the cards draggable
    $( "div", $(".cardswrapper") ).draggable({
        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: "document",
        helper: "clone",
        cursor: "move"
    });

    // 使得初始状态框是可以接受的droppable

    $("#f-box").droppable({
        accept: "#f-cwrapper > div",
        drop: function( event, ui ) {
            deletecardf( ui.draggable );
        }
    });
    $("#l-box").droppable({
        accept: "#l-cwrapper > div",
        drop: function( event, ui ) {
            deletecardl( ui.draggable );
        }
    });


    // 使得原先的卡片盒子也是可以接受的
    $("#f-cwrapper").droppable({
        accept: "#f-box > div",
        drop: function( event, ui ) {
            recyclecardf( ui.draggable );
        }
    });
    $("#l-cwrapper").droppable({
        accept: "#l-box > div",
        drop: function( event, ui ) {
            recyclecardl( ui.draggable );
        }
    });

    // 删除原位置的卡片
    function deletecardf( $item ) {
        $item.fadeOut(200,function() {
            var $list =  $("#f-box").length ?
                $("#f-box"):
                $( "<div class='cardswrapper'/>" ).appendTo( $("#f-box") );

            $item.appendTo( $list ).fadeIn(200);
        });
    }
    function deletecardl( $item ) {
        $item.fadeOut(200,function() {
            var $list =  $("#l-box").length ?
                $("#l-box"):
                $( "<div class='cardswrapper'/>" ).appendTo( $("#l-box") );

            $item.appendTo( $list ).fadeIn(200);
        });
    }

    // 恢复原位置的卡片
    function recyclecardf( $item ) {
        $item.fadeOut(200,function() {
            $item
                .appendTo($("#f-cwrapper"))
                .fadeIn(200);
        });
    }
    function recyclecardl( $item ) {
        $item.fadeOut(200,function() {
            $item
                .appendTo($("#l-cwrapper"))
                .fadeIn(200);
        });
    }

    //生成结果的算法开始
    $("#subbtn").on("click",function(){
        var cardnum = $('#f-box div').size()+$("#l-box div").size();
        if( cardnum != 18){
            alert("请将初始状态和最终状态设置完整！");
        }
        else{
            //alert("设置成功");
            var fstatus = getCardsNum("f-box","f-card");
            var lstatus = getCardsNum("l-box","l-card");
            main(fstatus,lstatus);
        }
    });

    //得到卡片的序号数组函数
    function getCardsNum(parent,content){
        var NumberArr = [];
        var CardsArr = document.getElementById(parent).getElementsByClassName(content);
        for(var i=0;i<CardsArr.length;i++){
            NumberArr.push(CardsArr[i].getAttribute("name"));
        }
        return(NumberArr);
    }

    //对得到的两个数组进行操作的函数

    function main(fsta,lsta){
        //生成open表close表
        var opentable = [];
        var gn = 0;
        var fn = costEstimate(fsta,lsta,gn);//传入初始和最终的九个数字的一维数组
        var afsta = [].concat(fsta);//把初始状态赋值给一个新的数组

        //var afsta = new Array;
        //afsta = fsta;这是一个重大错误，不是把值赋值过去而是b作为a的引用，b改变的是a

        afsta.push(fn);//将一维数组的总代价存到数组的最后一位
        opentable.push(afsta);//现在，已经把s0存入了open表,在open表里的是十个数字的一维数组

        operate(opentable,lsta);
    }

    //计算该节点的总代价f(n)=g(n)+h（n），即当前每个牌到其目标位置的距离和，返回值为估价f（n）
    //传入初始和最终的九个数字的一维数组
    function costEstimate(statusArr,lstatusArr,gn){
        var count = 0;
        var tstatusArr = saveArry(statusArr);
        var tlstatusArr = saveArry(lstatusArr);
        for(var row=0;row<3;row++){
            for(var col=0;col<3;col++){
                if(tstatusArr[row][col]!=0){
                    for(var row2=0;row2<3;row2++){
                        for(var col2=0;col2<3;col2++){
                            if(tlstatusArr[row2][col2]==tstatusArr[row][col]){
                                count += Math.abs(row2-row)+Math.abs(col2-col);
                            }
                        }
                    }
                }
            }
        }
        return count+gn;
    }

    function operate(opentb,lstaarr){
        var closetable = [];
        var nodegn = 1;
        while(1){
            if(openept(opentb)){
                alert("问题无解");
                break;
            }//取出open表，判断是否每一个元素的末尾都是999，如果都是999，相当于open表为空，失败退出
            else{
                var nnode = [].concat(minf(opentb));//取出open表hn最小的一个节点，把原来的opentable这个节点的fn值改成超级大
                //此时nnode是十个数字的一维数组
                closetable.push(nnode);//把n放入close表，close表中的子元素也是十个数字的一维数组
                if(compare(closetable[closetable.length-1],lstaarr)){
                    //alert("求解成功");//判断是否是目标
                    generate(closetable);
                    break;
                }
                else{
                    extension(nnode,opentb,nodegn,lstaarr);
                    //传入节点n（十个数字的一维），open表，现在的gn，最终的状态数组（九个数字的一维数组），结果是改变opentable
                    nodegn++;
                }



            }
        }
    }

    //判断open表是否每一个元素末尾都是999
    function openept(optable){
        var cout = 0;
        for(var i = 0;i<optable.length;i++){
            if(optable[i][optable[i].length-1]==999){
                cout++;
            }
        }
        return (cout == optable.length);
    }

    //扩展n节点
    function extension(node,optbl,nodgn,lstaar){
        var position = 0;
        //首先求出空白格子的位置
        for(var i = 0;i<node.length-1;i++){
            if(node[i] == 0){
                position = i;
                break;
            }
        }
        //选择移动方式
        switch (position){
            case 0:
                movedown(node,position,optbl,nodgn,lstaar);
                moveright(node,position,optbl,nodgn,lstaar);
                break;
            case 1:
                movedown(node,position,optbl,nodgn,lstaar);
                moveleft(node,position,optbl,nodgn,lstaar);
                moveright(node,position,optbl,nodgn,lstaar);
                break;
            case 2:
                movedown(node,position,optbl,nodgn,lstaar);
                moveleft(node,position,optbl,nodgn,lstaar);
                break;
            case 3:
                movedown(node,position,optbl,nodgn,lstaar);
                moveright(node,position,optbl,nodgn,lstaar);
                moveup(node,position,optbl,nodgn,lstaar);
                break;
            case 4:
                movedown(node,position,optbl,nodgn,lstaar);
                moveleft(node,position,optbl,nodgn,lstaar);
                moveright(node,position,optbl,nodgn,lstaar);
                moveup(node,position,optbl,nodgn,lstaar);
                break;
            case 5:
                movedown(node,position,optbl,nodgn,lstaar);
                moveleft(node,position,optbl,nodgn,lstaar);
                moveup(node,position,optbl,nodgn,lstaar);
                break;
            case 6:
                moveup(node,position,optbl,nodgn,lstaar);
                moveright(node,position,optbl,nodgn,lstaar);
                break;
            case 7:
                moveup(node,position,optbl,nodgn,lstaar);
                moveleft(node,position,optbl,nodgn,lstaar);
                moveright(node,position,optbl,nodgn,lstaar);
                break;
            case 8:
                moveup(node,position,optbl,nodgn,lstaar);
                moveleft(node,position,optbl,nodgn,lstaar);
                break;
        }
    }

    //移动函数，四个方向
    function movedown(fnode,fposi,foptbl,fgn,flstaar){
        var temp;
        var _fnode = [].concat(fnode);
        temp = _fnode[fposi];
        _fnode[fposi] = _fnode[fposi+3];
        _fnode[fposi+3]=temp;
        pushnode(_fnode,foptbl,fgn,flstaar);//参数是十个数字的一维
    }
    function moveup(fnode,fposi,foptbl,fgn,flstaar){
        var temp;
        var _fnode = [].concat(fnode);
        temp = _fnode[fposi];
        _fnode[fposi] = _fnode[fposi-3];
        _fnode[fposi-3]=temp;
        pushnode(_fnode,foptbl,fgn,flstaar);
    }
    function moveleft(fnode,fposi,foptbl,fgn,flstaar){
        var temp;
        var _fnode = [].concat(fnode);
        temp = _fnode[fposi];
        _fnode[fposi] = _fnode[fposi-1];
        _fnode[fposi-1]=temp;
        pushnode(_fnode,foptbl,fgn,flstaar);
    }
    function moveright(fnode,fposi,foptbl,fgn,flstaar){
        var temp;
        var _fnode = [].concat(fnode);
        temp = _fnode[fposi];
        _fnode[fposi] = _fnode[fposi+1];
        _fnode[fposi+1]=temp;
        pushnode(_fnode,foptbl,fgn,flstaar);//参数为新扩展的node，open表，gn，最终状态一维数组9个数字
    }

    //计算fn，存储函数，判断是否有重复，符合条件就存储到open表中,其中node是含有10个数的
    function pushnode(nodename,poptbl,pnodgn,plstaar){
        nodename.pop();
        var nodefn = costEstimate(nodename,plstaar,pnodgn);
        nodename.push(nodefn);
        var tag = 0;
        for(var i = 0;i<poptbl.length;i++){
            if(compare(poptbl[i],nodename))tag++;
        }
        if(tag == 0){
            poptbl.push(nodename);
        }
    }



    //在open表中寻找fn最小的点，open表里的都是附加最后一位总代价的
    function minf(optable){

        var min = [].concat(optable[0]);
        var nodenum = 0;
        for(var i = 0;i<optable.length;i++){
            if(optable[i][optable[i].length-1]<min[min.length-1]){
                min = [];
                min = [].concat(optable[i]);
                nodenum = i;
            }
        }
        optable[nodenum][optable[nodenum].length-1] = 999;
        return min;

    }


    //工具方法：比较两个状态是否相等,只比前9位，唉，这里把for循环写死了，不太好，待优化
    function compare(arr1,arr2){
        var count = 0;
        for(var i = 0;i<9;i++){
            if(arr1[i] == arr2[i])count++;
        }
        return (count == 9);
    }

    //工具方法：将一维数组转化为三行三列的数组
    function saveArry(oneArr){
        var stable =[ ];
        var t = [ ];
        for(var i = 0;i<oneArr.length;i++){
            t.push(oneArr[i]);
            if(t.length == 3){
                stable.push(t);
                t = [ ];
            }
        }
        return stable;
    }

    //把close表一个个拆解为单个一维数组，每个数组进行dom操作，生成div块
    function generate(closetb){

        var cparent = document.getElementById("air-container");
        for(var i = 0;i<closetb.length;i++){

            var ccontent = document.createElement("div");
            ccontent.className = "re-box";
            cparent.appendChild(ccontent);
            for(var j = 0;j<closetb[i].length-1;j++){

                var boxcard = document.createElement("div");
                boxcard.className = "result-card";
                ccontent.appendChild(boxcard);
                if(closetb[i][j] != 0){
                    var cardtext1 = document.createElement("p");
                    $(cardtext1).text(closetb[i][j]);
                    boxcard.appendChild(cardtext1);
                }
                else{
                    var cardtext2 = document.createElement("p");
                    boxcard.appendChild(cardtext2);
                }
            }
        }
    }



});