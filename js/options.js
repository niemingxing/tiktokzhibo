// options.js
document.addEventListener('DOMContentLoaded', function() {
    var mKeyInput = document.getElementById('mKey');
    var replyIntervalTime = document.getElementById('replyIntervalTime');
    var autoReplyInput = document.getElementById('autoReply');
    var makeDataTypeSelect = document.getElementById('makeDataType');
    var userKeywordInput = document.getElementById('userKeyword');
    var dataNumsInput = document.getElementById('dataNums');
    var commentContentInput = document.getElementById('commentContent');
    var saveButton = document.getElementById('saveButton');
    var checkBoxes = document.getElementsByName('action');
    var addPrefixRandom = document.getElementById('addPrefixRandom');
    var addSuffixRandom = document.getElementById('addSuffixRandom');
    // 获取保存的密钥值并设置输入框的默认值
    chrome.storage.local.get('nmx_ttlive_setting', function(result) {
        let setting = result.nmx_ttlive_setting;
        if (setting) {
            mKeyInput.value = setting.mkey;
            autoReplyInput.value = setting.autoReply;
            replyIntervalTime.value = setting.replyIntervalTime;
            makeDataTypeSelect.value = setting.makeDataType;
            dataNumsInput.value = setting.dataNums;
            commentContentInput.value = setting.commentContent;
            userKeywordInput.value = setting.userKeyword;
            for (const checkbox of checkBoxes) {
                const value = checkbox.value;
                if (setting.actionMap[value] !== undefined) {
                    checkbox.checked = setting.actionMap[value];
                }
            }

            if(setting.addPrefixRandom == 1){
                addPrefixRandom.checked = true;
            }else{
                addPrefixRandom.checked = false;
            }

            if(setting.addSuffixRandom == 1){
                addSuffixRandom.checked = true;
            }else{
                addSuffixRandom.checked = false;
            }
            console.log(setting);
        }
    });

    // 保存按钮点击事件处理程序
    saveButton.addEventListener('click', function() {
        let setting = {
            'mkey':  mKeyInput.value,
            'autoReply': autoReplyInput.value,
            'replyIntervalTime':replyIntervalTime.value,
            'makeDataType':makeDataTypeSelect.value,
            'dataNums':dataNumsInput.value,
            'commentContent':commentContentInput.value,
            'userKeyword':userKeywordInput.value
        };
        if(addPrefixRandom.checked){
            setting.addPrefixRandom = 1;
        }else{
            setting.addPrefixRandom = 0;
        }

        if(addSuffixRandom.checked){
            setting.addSuffixRandom = 1;
        }else{
            setting.addSuffixRandom = 0;
        }

        //获取操作map
        const selectedOptions = {};
        for (const checkbox of checkBoxes) {
            selectedOptions[checkbox.value] = checkbox.checked;
        }
        setting.actionMap = selectedOptions;

        chrome.storage.local.set({ 'nmx_ttlive_setting': setting }, function() {
            alert('设置已保存');
        });
    });
});
