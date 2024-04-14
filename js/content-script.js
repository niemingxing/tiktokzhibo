let currentDomain = window.location.hostname;
let autoReplyText = '';
let autoCommentText = '';
let addPrefixRandom = false;
let addSuffixRandom = false;
let replyIntervalTime = 5;
let isAutoOperate = false;
let makeDataType = '';
let dataNums = 0;
let userKeyword = '';
let hasMakeDataNums = 0;
let actionMap = {};
let minDelay = 2000;
let maxDelay = 3000;
/**
 * 初始化弹层
 */
function initToolButton() {
	const html = '<div class="gpt-sr-container">\n' +
		'    <div class="gpt-sr-sidebar">\n' +
		'      <button id="dylive-sr-toggleButton">开启自动操作</button>\n' +
		'    </div>\n' +
		'  </div>\n' +
		'  \n' +
		'  <div id="dylive-sr-popup" class="gpt-sr-popup">\n' +
		'    <button class="gpt-sr-close-btn">&times;</button>\n' +
		'	 <button class="gpt-sr-starting-btn">开始执行</button>\n' +
		'    <div class="gpt-sr-content">\n' +
		'      <h2 class="gpt-sr-title">关键词列表</h2>\n' +
		'      <ul class="gpt-sr-list">\n' +
		'      </ul>\n' +
		'    </div>\n' +
		'  </div>';
	const popupElement = document.createElement("div");
	popupElement.innerHTML = html;
	document.body.appendChild(popupElement);
	document.querySelector("#dylive-sr-toggleButton").addEventListener("click", function() {
		if(this.innerText.includes("开启自动操作"))
		{
			this.disabled = true;
			isAutoOperate = true;
			this.style.backgroundColor = 'red';
			this.innerText = this.innerText.replace("开启自动操作","关闭自动操作");
			chrome.runtime.sendMessage({"type":"check_mkey"}, function (response) {
				console.log(response.farewell)
			});
		}
		else if(this.innerText.includes("关闭自动操作"))
		{
			this.disabled = false;
			isAutoOperate = false;
			this.style.backgroundColor = '#00bebd';
			this.innerText = this.innerText.replace("关闭自动操作","开启自动操作");
		}
	});
}

function activiteToolButton()
{
	document.querySelector("#dylive-sr-toggleButton").disabled = false;
}

function updateHandleNums()
{
	let buttonElement = document.querySelector("#dylive-sr-toggleButton")
	let buttonText = buttonElement.textContent;
	if(buttonText.includes("("))
	{
		buttonElement.textContent = buttonText.replace(/\([^)]*\)/g, "(" + hasMakeDataNums + ")");
	}
	else
	{
		buttonElement.textContent = buttonText + "(" + hasMakeDataNums + ")";
	}

}

/**
 * 初始化提示窗
 */
function initPromptMessagePopup()
{
	let html = "<div id=\"nmx_dylive_popup\" class=\"custom-popup\">\n" +
		"\t\t<div class=\"custom-popup-overlay\"></div>\n" +
		"\t\t<div class=\"custom-popup-content\">\n" +
		"\t\t\t<span id=\"nmx_dylive_popup_message\" class=\"custom-popup-question\"></span>\n" +
		"\t\t\t<button id=\"nmx_dylive_close_popupbtn\" class=\"custom-popup-close-btn\">确认</button>\n" +
		"\t\t</div>\n" +
		"\t</div>";
	const popupElement = document.createElement("div");
	popupElement.innerHTML = html;
	document.body.appendChild(popupElement);
	// 获取弹窗元素
	const popup = document.getElementById('nmx_dylive_popup');
	// 获取关闭按钮元素
	const closeButton = document.getElementById('nmx_dylive_close_popupbtn');

	// 点击关闭按钮关闭弹窗
	closeButton.addEventListener('click', function (){
		popup.style.display = 'none';
	});
}


// 显示弹窗并设置错误提示文字
function showPromptMessagePopup(message,type =1) {
	// 获取弹窗元素
	const popup = document.getElementById('nmx_dylive_popup');
	// 获取错误提示元素
	const errorText = document.getElementById('nmx_dylive_popup_message');
	errorText.textContent = message;
	popup.style.display = 'block';
	if(type == 2)
	{
		// 获取关闭按钮元素
		const closeButton = document.getElementById('nmx_dylive_close_popupbtn');
		closeButton.style.display = 'none';
		setTimeout(function (){
			closeButton.click();
		},3000);
	}
}

/**
 * 引入css文件
 * @param url
 */
function addStylesheet(url) {
	const linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	linkElement.type = "text/css";
	linkElement.href = chrome.runtime.getURL(url);
	document.head.appendChild(linkElement);
}

function startWork()
{
	let pageType = getPageType();
	if(pageType == "tiktok_live")
	{
		startAutoReply();
	}
	else if(pageType == "douyin_recommend")
	{
		startAutoMakeData();
	}
}



/**
 * 开始自动公屏回复
 */
function startAutoReply()
{
	let chatTextArea = document.querySelector("div[class*=DivEditor]");
	let intervalId = setInterval(() => {
		if(!isAutoOperate) clearInterval(intervalId);
		const delay = getRandomDelay(minDelay, maxDelay);
		setTimeout(() => {
			console.log(replyIntervalTime * 1000);
			console.log(appendRandomDigits(getRandomContentFromText(autoReplyText)));
			triggerEditEvents(chatTextArea,appendRandomDigits(getRandomContentFromText(autoReplyText)));
			console.log(chatTextArea);
			setTimeout(function (){
				let newSendButton = document.querySelector("div[class*=DivPostButton] svg");
				if(newSendButton)
				{
					console.log(newSendButton.firstElementChild);
					// 创建并分发一个 click 事件
					let clickEvent = new MouseEvent("click", {
						bubbles: true,
						cancelable: true,
						view: window
					});
					newSendButton.firstElementChild.dispatchEvent(clickEvent);
				}
			},500);
		}, delay);
	}, replyIntervalTime * 1000); // 这里设置 setInterval 的时间间隔为最大等待时间
}

/**
 * 开始自动做数据
 */
function startAutoMakeData()
{
	makeDataExec();

	let intervalId = setInterval(function (){
		if(!isAutoOperate){
			clearInterval(intervalId);
		}
		updateHandleNums();
	},3000);
}

async function makeDataExec()
{
	if(hasMakeDataNums >= dataNums)
	{
		showPromptMessagePopup("已经自动处理完" + dataNums + "条数据！");
		return;
	}
	else if(!isAutoOperate)
	{
		return;
	}
	let activeVideo = document.querySelector("div[data-e2e=feed-active-video]");
	if(activeVideo)
	{
		if (makeDataType =="1")
		{
			let nickNameObj = activeVideo.querySelector("div[data-e2e=feed-video-nickname]");
			let nickName = nickNameObj.textContent;
			console.log(nickName);
			if(nickName.includes(userKeyword))
			{
				console.log("包含关键词：" + userKeyword);
			} else {
				console.log("不包含关键词：" + userKeyword);
				await doNextVideoData();
				return;
			}
		}
		else if(makeDataType == "2")
		{
			// 生成一个 1 到 100 之间的随机整数
			const min = 1;
			const max = 100;
			const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
			if(randomInteger <=50){
				console.log("随机结果不处理");
				await doNextVideoData();
				return;
			}
			else{
				console.log("随机结果可以处理");
			}
		}

		let likeObj = activeVideo.querySelector("div[data-e2e=video-player-digg]");
		if(likeObj)
		{

			//评论
			let commentObj = activeVideo.querySelector("div[data-e2e=feed-comment-icon]");
			if(commentObj) {
				if(actionMap['comment'])
				{
					let doRes = '';
					doRes = await doComment(commentObj);
					console.log("doComment:" + doRes);
					doRes = await inputCommentContent();
					console.log("inputCommentContent:" + doRes);
					doRes = await submitCommentContent();
					console.log("submitCommentContent:" + doRes);
					doRes = await submitCommentContentComplete(commentObj);
					console.log("submitCommentContentComplete:" + doRes);
				}
			}

			//收藏
			let collectObj = activeVideo.querySelector("div[data-e2e=video-player-collect]");
			if(collectObj)
			{
				let clState = collectObj.getAttribute('data-e2e-state');
				if(clState == "video-player-no-collect")
				{
					if(actionMap['favorite'])
					{
						let doRes = await doCollect(collectObj);
						console.log("doCollect:" + doRes);
					}
				}
			}

			//点赞
			let fwState = likeObj.getAttribute('data-e2e-state');
			if(fwState == "video-player-no-digged")
			{
				if(actionMap['like'])
				{
					let doRes = await doLike(likeObj);
					console.log("doLike:" + doRes);
				}

			}

			//关注
			let followObj = activeVideo.querySelector("div[data-e2e=feed-follow-icon]");
			if(followObj)
			{
				let svgObj = followObj.querySelector("svg");
				let computedStyle = window.getComputedStyle(svgObj);
				let displayValue = computedStyle.getPropertyValue("display");
				console.log(displayValue);
				if(displayValue == "block")
				{
					if(actionMap['follow'])
					{
						let doRes = await doFollow(followObj);
						console.log("doFollow:" + doRes);
					}

				}
			}

			//增加完成数据
			hasMakeDataNums ++;
			await doNextVideoData();
		}
		else
		{
			await doNextVideoData();
		}
	}
	else
	{
		await doNextVideoData();
	}
}

function doFollow(target) {
	return new Promise(function(resolve, reject) {
		setTimeout(function (){
			target.firstElementChild.click();
			resolve("success");
		},getRandomDelay(minDelay, maxDelay));
	})
}

function doLike(target)
{
	return new Promise(function(resolve, reject) {
		setTimeout(function (){
			target.click();
			resolve("success");
		},getRandomDelay(minDelay, maxDelay));
	})
}

function doCollect(target)
{
	return new Promise(function(resolve, reject) {
		setTimeout(function (){
			target.click();
			resolve("success");
		},getRandomDelay(minDelay, maxDelay));
	})
}

function doComment(target)
{
	return new Promise(function(resolve, reject) {
		setTimeout(function (){
			target.click();
			resolve("success");
		},getRandomDelay(minDelay, maxDelay));
	})
}

function inputCommentContent()
{
	return new Promise(function(resolve, reject) {
		setTimeout(function (){

			let commentArea = document.querySelector("div.comment-input-inner-container span");
			if(commentArea) commentArea.click();
			setTimeout(function (){
				let commentInput = document.querySelector("div.comment-input-inner-container div.DraftEditor-editorContainer").firstElementChild;
				console.log(commentInput);
				copyToClipboard(getRandomContentFromText(autoCommentText));
				// 设置编辑器焦点
				commentInput.focus();
				document.execCommand("paste");
				console.log("点击留言框");
			},300);
			resolve("success");
		},getRandomDelay(minDelay, maxDelay));
	})
}

function submitCommentContent()
{
	return new Promise(function(resolve, reject) {
		setTimeout(function (){
			let optBtnObjs = document.querySelector("div.commentInput-right-ct").firstElementChild;
			let commentSubmitObj = optBtnObjs.children[2];
			if(commentSubmitObj)
			{
				commentSubmitObj.click();
			}
			resolve("success");
		},getRandomDelay(minDelay, maxDelay));
	})
}

function submitCommentContentComplete(target)
{
	return new Promise(function(resolve, reject) {
		setTimeout(function (){
			target.click();
			resolve("success");
		},getRandomDelay(minDelay, maxDelay));
	})
}

function doNextVideoData()
{
	return new Promise(function(resolve, reject) {
		setTimeout(function (){
			let activeVideo = document.querySelector("div[data-e2e=feed-active-video]");
			let nextVideoBtn;
			if(activeVideo)
			{
				nextVideoBtn = activeVideo.querySelector("div[data-e2e=video-switch-next-arrow]");
			}
			if(!nextVideoBtn)
			{
				nextVideoBtn = document.querySelector("div[data-e2e=video-switch-next-arrow]");
			}
			console.log(nextVideoBtn);
			nextVideoBtn.click();
			setTimeout(function (){
				makeDataExec();
			},getRandomDelay(minDelay, maxDelay));
			resolve("success");
		},getRandomDelay(minDelay, maxDelay));
	})
}

// 复制文本到剪贴板
function copyToClipboard(text) {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.select();
	document.execCommand("copy");
	document.body.removeChild(textArea);
}


// 生成随机三位数
function generateRandomNumber() {
	return Math.floor(Math.random() * 900) + 100; // 生成100到999之间的随机数
}

// 给字符串前后拼接随机三位数
function appendRandomDigits(str) {
	const randomNumber1 = generateRandomNumber();
	const randomNumber2 = generateRandomNumber();
	if(addPrefixRandom){
		str = randomNumber1 + str
	}
	if(addSuffixRandom){
		str = str + randomNumber2;
	}
	return str;
}

function getRandomDelay(min, max) {
	// 生成一个[min, max]之间的随机数，单位是毫秒
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 获取页面类型
 * @returns {string}
 */
function getPageType()
{
	currentUrl = window.location.href;
	let pageType = '';
	if(currentUrl.includes("https://www.douyin.com/"))
	{
		pageType = "douyin_recommend";
	}
	else if(currentUrl.includes("/live"))
	{
		pageType = "tiktok_live";
	}
	console.log(pageType);
	return pageType;
}

/**
 * contenteditable=true 的 div 编辑器
 * @param obj
 * @param value
 */
function triggerEditEvents(obj,value) {
	// 创建输入事件
	var inputEvent = new Event('input', {
		bubbles: true,
		cancelable: true
	});
	// 创建按键事件
	var keydownEvent = new KeyboardEvent('keydown', {
		key: '', // 这里可以设置你想要触发的按键
		bubbles: true,
		cancelable: true
	});
	// 创建按键事件
	var keyupEvent = new KeyboardEvent('keyup', {
		key: '', // 这里可以设置你想要触发的按键
		bubbles: true,
		cancelable: true
	});
	obj.textContent = value;
	// 将焦点放在文本末尾
	var range = document.createRange();
	range.selectNodeContents(obj);
	range.collapse(false); // 将焦点移动到文本末尾
	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
	// 触发输入事件
	obj.dispatchEvent(inputEvent);
	// 触发按键事件
	obj.dispatchEvent(keydownEvent);
	obj.dispatchEvent(keyupEvent);
}

/**
 * input对象输入、改变、键盘事件分发
 * @param obj
 * @param value
 */
function inputDispatchEventEvent(obj,value)
{
	let inputEvent = new InputEvent('input', {
		bubbles: true,
		cancelable: true,
		inputType: 'insertText',
		data:value
	});
	let changeEvent = new Event('change', {
		bubbles: true,
		cancelable: true
	});
	let keyUpEvent = new KeyboardEvent('keyup', {
		key: '',
		bubbles: true,
		cancelable: true
	});
	obj.value = value;
	obj.focus();
	obj.dispatchEvent(inputEvent);
	obj.dispatchEvent(changeEvent);
	obj.dispatchEvent(keyUpEvent);
}

function getRandomContentFromText(inputText) {
	// 首先将输入字符串按换行符拆分成一个数组
	const lines = inputText.split('\n');

	// 随机生成一个索引，范围在0到数组长度之间
	const randomIndex = Math.floor(Math.random() * lines.length);

	// 返回随机选取的一行
	return lines[randomIndex];
}

function initSetting(callback)
{
	// 获取存储的值
	chrome.storage.local.get('nmx_ttlive_setting', function (data) {
		autoReplyText = (data.hasOwnProperty("nmx_ttlive_setting") && data.nmx_ttlive_setting.hasOwnProperty("autoReply")) ? data.nmx_ttlive_setting.autoReply : '';
		autoCommentText = (data.hasOwnProperty("nmx_ttlive_setting") && data.nmx_ttlive_setting.hasOwnProperty("commentContent")) ? data.nmx_ttlive_setting.commentContent : '';
		makeDataType = (data.hasOwnProperty("nmx_ttlive_setting") && data.nmx_ttlive_setting.hasOwnProperty("makeDataType")) ? data.nmx_ttlive_setting.makeDataType : '';
		dataNums = (data.hasOwnProperty("nmx_ttlive_setting") && data.nmx_ttlive_setting.hasOwnProperty("dataNums")) ? data.nmx_ttlive_setting.dataNums : '';
		dataNums = parseInt(dataNums, 10);
		userKeyword = (data.hasOwnProperty("nmx_ttlive_setting") && data.nmx_ttlive_setting.hasOwnProperty("userKeyword")) ? data.nmx_ttlive_setting.userKeyword : '';
		actionMap = (data.hasOwnProperty("nmx_ttlive_setting") && data.nmx_ttlive_setting.hasOwnProperty("actionMap")) ? data.nmx_ttlive_setting.actionMap : {};
		addPrefixRandom = (data.hasOwnProperty("nmx_ttlive_setting") && data.nmx_ttlive_setting.hasOwnProperty("addPrefixRandom")) ? data.nmx_ttlive_setting.addPrefixRandom : 0;
		addSuffixRandom = (data.hasOwnProperty("nmx_ttlive_setting") && data.nmx_ttlive_setting.hasOwnProperty("addSuffixRandom")) ? data.nmx_ttlive_setting.addSuffixRandom : 0;
		replyIntervalTime = (data.hasOwnProperty("nmx_ttlive_setting") && data.nmx_ttlive_setting.hasOwnProperty("replyIntervalTime")) ? data.nmx_ttlive_setting.replyIntervalTime : replyIntervalTime;
		// 在这里使用存储的值
		console.log(autoReplyText);
		if(callback) callback();
	});
}
// 在页面加载完成后插入弹层和引入CSS文件
window.onload = function() {
	if(currentDomain.includes("www.tiktok.com"))
	{
		initSetting(function (){
			initPromptMessagePopup();
			initToolButton();
			addStylesheet("css/page_layer.css");
		});
	}
};
/**
 * 事件监听
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	window.focus();
	console.log(message.type);
	if(message.type == 'open_auto_reply')
	{
		isAutoOperate = true;
		startAutoReply();
	}
	else if(message.type == 'close_auto_reply')
	{
		isAutoOperate = false;
	}
	else if(message.type == 'check_mkey_complete')
	{
		activiteToolButton();
		if(message.data.hasOwnProperty("code") && message.data.code !=0)
		{
			showPromptMessagePopup(message.data.message);
		}
		else
		{
			startWork();
		}
	}
});
