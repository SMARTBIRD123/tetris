var tetris={
	CSIZE:26,//每个格子的大小
	OFFSET:15,//边框需要修正的距离
	RN:20,//总行数
	CN:10,//总列数
	pg:null,//保存游戏主界面div
	shape:null,//正在下落的主角图形
	timer:null,//保存定时器序号
	interval:500,//保存下落速度
	wall:null,//保存停止下落的格子的墙数组
	lines:0,//保存消除的总行数
	score:0,//保存总得分
	SCORES:[0,10,30,60,150],//
	nextShape:null,//保存下一个备胎图形
	state:1,//保存游戏的状态
	GAMEOVER:0,
	RUNNING:1,
	PAUSE:2,
	IMGS:{
		GAMEOVER:"img/game-over.png",
		PAUSE:"img/pause.png",
	},
	level:1,//保存当前级别
	levelLn:10,//保存每几行升一级
	levelS:200,//保存每升一级减去的秒数
	//根据当前状态，回执对应图片
	paintState:function(){
		//创建一个img
		var img=new Image();
		//如果state是PAUSE
		if(this.state==this.PAUSE){
			//设置img的src为IMGS的PAUSE
			img.src=this.IMGS.PAUSE;
		}else if(this.state==this.GAMEOVER){
		//否则，如果state是GAMEOVER
			//设置img的src为IMGS的GAMEOVER
			img.src=this.IMGS.GAMEOVER;
		}
		//将img追加到pg中
		this.pg.appendChild(img);
	},
	myContinue:function(){
		//修改游戏状态为RUNNING
		this.state=this.RUNNING;
		//重绘一切
		this.paint();
		//重启定时器
		this.timer=setInterval(this.moveDown.bind(this),this.interval);
	},
	//暂停
	pause:function(){
		//停止周期性定时器
		clearInterval(this.timer);
		//清除timer
		this.timer=null;
		//修改游戏的state为PAUSE
		this.state=this.PAUSE;
		//重绘一切
		this.paint();
	},
	start:function(){//启动游戏
		//将lines和score清0
		this.lines=0;
		this.score=0;
		this.level=1;
		this.state=this.RUNNING;
		this.interval=1000;
		//将wall初始化为空数组
		this.wall=[];
		//r从0开始，到<RN结束，每次增1
		for(var r=0;r<this.RN;r++){
			//设置wall中r位置为一个CN个空元素的新数组
			this.wall[r]=new Array(this.CN);
		}
		this.shape=this.random();
		this.nextShape=this.random();
		//找到class为playground的div保存在pg属性中
		this.pg=document.querySelector(".playground");
		this.paint();
		//启动周期性定时器，传入moveDown方法提前绑定this，设置时间间隔为interval，将序号保存在变量
		this.timer=setInterval(this.moveDown.bind(this),this.interval);
		var me=this;
		//为当前页面绑定键盘按下事件
		document.onkeydown=function(e){
			switch(e.keyCode){
				case 40:me.state==me.RUNNING&&me.moveDown();break;//下
				case 37:me.state==me.RUNNING&&me.moveLeft();break;//左
				case 38:me.state==me.RUNNING&&me.rotateR();break;//上
				case 39:me.state==me.RUNNING&&me.moveRight();break;//右
				case 90:me.state==me.RUNNING&&me.rotateL();break;//
				case 80:me.state==me.RUNNING&&me.pause();break;//
				case 67:me.state==me.PAUSE&&me.myContinue();break;//
				case 81:me.state!=me.GAMEOVER&&me.quit();break;//
				case 83:me.state==me.GAMEOVER&&me.start();break;//
				case 32:me.state==me.RUNNING&&me.hardDrop();break;
			}
		}
	},
	//一键到底
	hardDrop:function(){
		//循环：可以下落
		while(this.canDown()){
			//调用moveDown方法
			this.moveDown();
		}
	},
	random:function(){
		switch(parseInt(Math.random()*7)){
			case 0:return new T();
			case 1:return new O();
			case 2:return new I();
			case 3:return new L();
			case 4:return new J();
			case 5:return new S();
			case 6:return new Z();
		}
	},
	//检测旋转是否成功
	canRotate:function(){
		//遍历主角图形中每个格子
		for(var i=0;i<this.shape.cells.length;i++){
			//将当前格子保存在变量cell中
			var cell=this.shape.cells[i];
			//如果当前格子的r<0或r>=RN或c<0或c>=CN
			if(cell.r<0||cell.r>=this.RN||cell.c<0||cell.c>=this.CN){
				return false;//返回false
			}
			//如果wall中和当前格子相同的位置有格
			if(this.wall[cell.r][cell.c]){
				return false;//返回false
			}
		}//(遍历结束)
		return true;//返回true
	},
	//顺时针
	rotateR:function(){
		//调用主角图形的rotateR方法	
		this.shape.rotateR();
		//如果不能旋转
		if(!this.canRotate()){
			//在调用主角图形的rotateL方法
			this.shape.rotateL();
		}
		this.paint();
	},
	//逆时针
	rotateL:function(){
		//调用主角图形的rotateL方法
		this.shape.rotateL();
		//如果不能旋转
		if(!this.canRotate()){
			//在调用主角图形的rotateR方法
			this.shape.rotateR();
		}
		this.paint();
	},
	canDown:function(){
		//遍历主角图形中每个格子
		for(var i=0;i<this.shape.cells.length;i++){
			//将当前格子保存在变量cell中
			var cell=this.shape.cells[i];
			//如果wall中，cell的下方位置不为空
				//返回false
			//如果当前格子的r等于RN-1
			if(cell.r==this.RN-1){
				//返回false
				return false;
			}
			if(this.wall[cell.r+1][cell.c]){
				return false;
			}
		}
		return true;//返回true
	},
	//将停止下落的主角图形，放入墙中相同位置
	landIntoWall:function(){
		//遍历主角图形中每个cell
		for(var i=0;i<this.shape.cells.length;i++){
			//将当前cell保存在变量cell中
			var cell=this.shape.cells[i];
			//将cell保存到wall中相同r，c的位置
			this.wall[cell.r][cell.c]=cell;
		}
	},
	canLeft:function(){
		//遍历主角图形中的每个格子
		for(var i=0;i<this.shape.cells.length;i++){
			//将当前格保存在变量cell中
			var cell=this.shape.cells[i];
			//如果cell的c等于0
			if(cell.c==0){
				//返回false
				return false;
			}
			//如果wall中cell左侧有格
			if(this.wall[cell.r][cell.c-1]){
				return false;//返回false
			}
		}
		return true;//返回true
	},
	moveLeft:function(){
		//如果可以左移
		if(this.canLeft()){
			//调用主角图形的moveLeft方法
			this.shape.moveLeft();
			//重绘一切
			this.paint();
		}
	},
	canRight:function(){
		//遍历主角图形中的每个格子
		for(var i=0;i<this.shape.cells.length;i++){
			//将当前格保存在变量cell中
			var cell=this.shape.cells[i];
			//如果cell的c等于CN-1
			if(cell.c==this.CN-1){
				return false;//返回false
			}
			//如果wall中cell右侧有格
			if(this.wall[cell.r][cell.c+1]){
				return false;//返回false
			}
		}
		return true;//返回true
	},
	moveRight:function(){
		//如果可以右移
		if(this.canRight()){
			//调用主角图形的moveLeft方法
			this.shape.moveRight();
			//重绘一切
			this.paint();
		}
	},
	//下落
	moveDown:function(){
		//如果可以下落
		if(this.canDown()){
			//主角图形shape的moveDown方法
			this.shape.moveDown();
		}else{
			this.landIntoWall();//将主角落入墙中
			var ln=this.deleteRows();//判断并删除行
			this.lines+=ln;
			//如果lines>level*levelLn
			if(this.lines>this.level*this.levelLn){
				//level+1
				this.level++;
				//interval-=(level-1)*levelS
				this.interval-=(this.level-1)*this.levelS
				//停止周期性定时器
				clearInterval(this.timer);
				//再启动周期性定时器
				this.timer=setInterval(this.moveDown.bind(this),this.interval);
			}
			this.score+=this.SCORES[ln];
			//如果游戏没有结束
			if(!this.isGameOver()){
				//备胎转正
				this.shape=this.nextShape;
				//随机生成新备胎
				this.nextShape=this.random();
			}else{//否则
				this.quit();//退游
			}
		}
		//重绘一切
		this.paint();
	},
	//退出游戏
	quit:function(){
		//修改游戏状态为GAMEOVER
		this.state=this.GAMEOVER;
		//停止定时器。清空timer
		clearInterval(this.timer);
		//重绘一切
		this.paint();
	},
	//判断游戏结束
	isGameOver:function(){
		//遍历备胎图形中每个cell
		for(var i=0;i<this.nextShape.cells.length;i++){
			//将当前cell保存在变量cell中
			var cell=this.nextShape.cells[i];
			//如果wall中cell相同位置有格
			if(this.wall[cell.r][cell.c]){
				return true;//返回true
			}
		}//遍历结束
		return false;//返回false
	},
	paintScore:function(){
		//设置id为score的元素的内容为当前对象的score属性
		score.innerHTML=this.score;
		//设置id为lines的元素的内容为当前对象的lines属性
		lines.innerHTML=this.lines;
		//设置id为level的元素的内容为当前对象的level
		level.innerHTML=this.level;
	},
	deleteRows:function(){
		//自底向上遍历wall中每一行,同时声明ln为0
		for(var r=this.RN-1,ln=0;r>=0;r--){
			//如果当前行为空
			if(this.wall[r].join("")==""){
				return ln;
			}
			//如果为当前行拍照后，找不到/^,|,,|,$/
			if(String(this.wall[r]).search(/^,|,,|,$/)==-1){
				this.deleteRow(r);//删除当前行
				r++;
				ln++;//ln+1
				//如果ln等于4
				if(ln==4){
					return ln;//返回ln
				}
			}
		}
	},
	deleteRow:function(r){
		//从r开始，自底向上遍历wall中每一行
		for(;r>=0;r--){
			//将wall中上一行赋值给当前行
			this.wall[r]=this.wall[r-1];
			//遍历wall中当前行的每个格
			for(var c=0;c<this.CN;c++){
				//如果当前格有效
				if(this.wall[r][c]){
					//将当前格的r+1
					this.wall[r][c].r++;
				}
			}//(遍历结束)
			//将上一行置为CN个空元素的新数组
			this.wall[r-1]=new Array(this.CN);
			//如果当前行的-2行为空
			if(this.wall[r-2].join("")==""){
				break;//退出循环
			}
		}
	},
	//重绘一切
	paint:function(){
		//如何删除pg下所有img元素
		this.pg.innerHTML=this.pg.innerHTML.replace(/<img[^>]+>/g,"");
		this.paintShape();//重绘主角图形
		this.paintWall();//重绘墙
		this.paintScore();//重绘分数
		this.paintNext();//重绘备胎0
		this.paintState();//重绘状态
	},
	paintNext:function(){
		//创建文档片段
		var frag=document.createDocumentFragment();
		//遍历备胎图形中的每个cell
		for(var i=0;i<this.nextShape.cells.length;i++){
			//将当前cell保存在变量cell中
			var cell=this.nextShape.cells[i];
			//创建一个img对象
			var img=new Image();
			//设置img的src为cell的src
			img.src=cell.src;
			//设置img的top为(cell.r+1)*CSIZE+OFFSET
			img.style.top=(cell.r+1)*this.CSIZE+this.OFFSET+"px";
			//设置img的left为(cell.c+11)*CSIZE+OFFSET
			img.style.left=(cell.c+10)*this.CSIZE+this.OFFSET+"px";
			//将img追加到frag中
			frag.appendChild(img);
		}//遍历结束
		//将frag追加到pg中
		this.pg.appendChild(frag);
	},
	//重绘墙
	paintWall:function(){
		var frag=document.createDocumentFragment();
		//从下向上遍历wall中的每一行
		for(var r=this.RN-1;r>=0;r--){
			//如果当前行所有元素都为空
			if(this.wall[r].join("")==""){
				//退出循环
				break;
			}
			for(var c=0;c<this.CN;c++){
			//遍历当前行中每一列
				//将wall中当前格保存在变量cell中
				var cell=this.wall[r][c];
				//如果cell有效
				if(cell){
					this.paintCell(cell,frag);
				}
			}
		}
		this.pg.appendChild(frag);
	},
	paintCell:function(cell,frag){
		var img=new Image();
		img.src=cell.src;
		img.style.top=this.CSIZE*cell.r+this.OFFSET+"px";
		img.style.left=this.CSIZE*cell.c+this.OFFSET+"px";			
		frag.appendChild(img);
	},
	paintShape:function(){
		var frag=document.createDocumentFragment();
		for(var i=0;i<this.shape.cells.length;i++){
			var cell=this.shape.cells[i];
			this.paintCell(cell,frag);
		}
		this.pg.appendChild(frag);
	}
}
window.onload=function(){
	tetris.start();
}