!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("fs")):"function"==typeof define&&define.amd?define(["fs"],e):(t=t||self,t.game=e(t.fs))}(this,function(t){"use strict";class e{constructor(){this.groupId=0,this.rootResList=new Map,this.groupList=new Map,this.allType=new Set,this.groupNameList=new Map}addGroup(t){return this.groupId++,this.groupList.set(this.groupId,new Map),this.groupNameList.set(this.groupId,t),this.groupId}clearGroup(t){let e=this.groupList.get(t);e&&e.size&&(this.groupList.delete(t),this.groupNameList.delete(t))}replaceGroupName(t,e){return this.groupNameList.get(t)?(this.groupNameList.set(t,e),e):null}getGroupName(t){let e="";return this.groupNameList.forEach(i=>{t===i&&(e=i)}),e}}class i{constructor(){this.initGroup="init",this.dataManager=new e,this.browseBtn=document.querySelector("#browse"),this.groupListNode=$("#groupListNode"),this.addGroupBtn=$("#addGroupBtn"),this.myListNode=$("#myListNode"),this.rootList=$("#rootList"),this.browseBtn.addEventListener("change",e=>{let i=this.browseBtn.files.item(0);if("application/json"===i.type){let e=i.path,o=e.split("\\");o.splice(o.length-2,2);let s=o.join("/")+"/assets/resources";if(this.setRootPath(s),t.existsSync(s)){this.clear(),this.dataManager.root=s,this.readDir(s),this.drawRootList();let e=t.readFileSync(i.path).toString();e.length?e=JSON.parse(e):(console.log("json文件为空"),this.addGroup(this.initGroup,!1))}else alert("root path is error!");console.log(s)}else alert("The format must be JSON!");console.log(i)}),this.addGroupBtn.on("click",()=>{this.addGroup("GroupName"+this.dataManager.groupList.size,!0);this.groupListNode.find("input").focus()}),this.groupListNode.on("click","dd",t=>{if(t.currentTarget){$(t.currentTarget).addClass("cur").siblings().removeClass("cur");let e=Number(t.currentTarget.getAttribute("data-id"));this.curGroupId!==e&&(this.drawByGroupIdList(e),this.curGroupId=e)}});let i;this.groupListNode.on("dblclick",".replaceGroupName",t=>{if(t.currentTarget){let e=$(t.currentTarget).find("input");e.prop("disabled",""),e.focus(),i=e.val()}}),this.groupListNode.on("focusout blur","input",t=>{$(t.currentTarget).attr("disabled","disabled");let e=$(t.currentTarget).val();e.match(/^[A-z]/)&&!e.match(/[^A-z0-9\_]/)?console.log("1231232可以开始"):($(t.currentTarget).val(i),this.hint("内容必须以字母开头，除了_不可以有其它特殊字符!"));console.log($(t.currentTarget).val())}),this.rootList.on("dblclick","dd",t=>{t.currentTarget&&this.addDataList(t.currentTarget.getAttribute("data-id"))})}addDataList(t){let e=this.dataManager.rootResList.get(t);if(e){let i=this.dataManager.groupList.get(this.curGroupId);i&&!i.get(t)&&(i.set(t,{resName:e.name,type:e.type,path:e.path}),this.drawItem(i.get(t)))}}drawItem(t){let e="";this.dataManager.allType.forEach(i=>{e+=`<option ${t.type===i?"selected":""}>${i}</option>`}),this.myListNode.prepend(`<dd data-id=${t.path}>\r\n        <div class="g0 resName">${t.resName}</div>\r\n        <div class="g0 resType select is-small">\r\n            <select>${e}</select>\r\n        </div>\r\n        <div class="g1">${t.path}</div>\r\n        <div class="g0 annotation">\r\n            <input class="input is-small" type="text" value="${t.note?t.note:""}" placeholder="注释">\r\n        </div>\r\n    </dd>`)}addGroup(t,e){if(this.dataManager.getGroupName(t))return void alert("分组名称已经存在");this.curGroupId=this.dataManager.addGroup(t),this.groupListNode.find("dd").removeClass("cur"),this.groupListNode.append(`<dd data-id=${this.curGroupId} class="tag g1 is-white cur ${e?"replaceGroupName":""}">\r\n        <input  disabled class="input is-small groupName" type="text" placeholder="Group name" value="${t}">\r\n        ${e?' <button class="delete is-small"></button>':""}\r\n    </dd>`),this.drawByGroupIdList(this.curGroupId)}drawByGroupIdList(t){let e=this.dataManager.groupList.get(t);e&&(this.myListNode.html(""),e.forEach(t=>{this.drawItem(t)}),console.log(e))}clear(){this.dataManager.rootResList.clear(),this.groupListNode.html(""),this.myListNode.html("")}setRootPath(t){document.querySelector("#rootNode").innerText=t}drawRootList(){console.log(this.dataManager.rootResList);let t="";this.dataManager.rootResList.forEach((e,i)=>{t+=`<dd data-id=${i} data-type=${e.type}>\r\n                <div class="g0 resName">${e.name}</div>\r\n                <div class="g0 resType">${e.type}</div>\r\n                <div class="g1">${this.dataManager.root+e.path} <a class="delete is-small"></a></div>\r\n                <div class="g0 size_me">${this.convertFileSize(e.size)}</div>\r\n            </dd>`}),this.rootList.html(t)}readDir(e){if(e.length){let i=t.readdirSync(e);for(let o=i.length-1;o>-1;o--)if(-1===i[o].indexOf(".meta")){let s=t.statSync(e+"/"+i[o]);if(s.isDirectory())this.readDir(e+"/"+i[o]);else if(s.isFile()){let t=i[o].replace("_","").split(".");this.dataManager.allType.add(t[1]);let r=(e+"/"+i[o]).replace(this.dataManager.root+"","");this.dataManager.rootResList.set(r,{name:t.join("_"),path:r,type:t[1],size:s.size})}}}}convertFileSize(t){return t/=1e3,t<1024?t.toFixed(2)+"KB":(t/=1e3).toFixed(2)+"MB"}hint(t){let e=$("#hintView");e.show(),e.text(t),this.hintTime&&clearTimeout(this.hintTime),this.hintTime=setTimeout(()=>{e.fadeOut(300)},2e3)}}class o{constructor(){new i}}return o});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9EYXRhTWFuYWdlci50cyIsIi4uL3NyYy9WaWV3TG9naWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIOaVsOaNrueuoeeQhuWZqFxyXG4gKi9cclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRhTWFuYWdlciB7XHJcblxyXG4gICAgLyoq5qC555uu5b2VICovXHJcbiAgICByb290OiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAvKiog5omA5pyJ55qE57G75Z6LICovXHJcbiAgICBhbGxUeXBlOiBTZXQ8c3RyaW5nPjtcclxuICAgIC8qKiDnu4TmlbDmja7liJfooaggKi9cclxuICAgIGdyb3VwTGlzdDogTWFwPG51bWJlciwgTWFwPHN0cmluZywgcmVzT2JqPj47XHJcbiAgICAvKiog57uE5ZCN56ew5YiX6KGoICovXHJcbiAgICBncm91cE5hbWVMaXN0OiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xyXG4gICAgLyoqIOmAkuWinueahOe7hGlkICovXHJcbiAgICBwcml2YXRlIGdyb3VwSWQ6IG51bWJlcjtcclxuXHJcbiAgICAvKiog5qC555uu5b2V5pWw5o2u5YiX6KGoICovXHJcbiAgICByb290UmVzTGlzdDogTWFwPHN0cmluZywgcm9vdExpc3RPYmo+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBJZCA9IDA7XHJcbiAgICAgICAgdGhpcy5yb290UmVzTGlzdCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmFsbFR5cGUgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgdGhpcy5ncm91cE5hbWVMaXN0ID0gbmV3IE1hcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5LiA57uEXHJcbiAgICAgKiBAcGFyYW0gbmFtZSDnu4TlkI3np7BcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnueUn+aIkOeahOe7hGlkXHJcbiAgICAgKi9cclxuICAgIGFkZEdyb3VwKG5hbWU6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICAgICAgdGhpcy5ncm91cElkKys7XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3Quc2V0KHRoaXMuZ3JvdXBJZCwgbmV3IE1hcCgpKTtcclxuICAgICAgICB0aGlzLmdyb3VwTmFtZUxpc3Quc2V0KHRoaXMuZ3JvdXBJZCwgbmFtZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBJZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIoOmZpOS4gOe7hFxyXG4gICAgICogQHBhcmFtIG5hbWUg57uE5ZCN56ewXHJcbiAgICAgKi9cclxuICAgIGNsZWFyR3JvdXAoaWQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBncm91cCA9IHRoaXMuZ3JvdXBMaXN0LmdldChpZCkgYXMgTWFwPHN0cmluZywgcmVzT2JqPjtcclxuXHJcbiAgICAgICAgaWYgKCFncm91cCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAoZ3JvdXAuc2l6ZSkgey8v5aaC5p6c5pyJ5pWw5o2u5piv5ZCm5Yig6ZmkXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBMaXN0LmRlbGV0ZShpZCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5kZWxldGUoaWQpO1xyXG4gICAgICAgIH0gZWxzZSB7Ly/nm7TmjqXliKDpmaRcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5L+u5pS557uE5ZCN56ewXHJcbiAgICAgKi9cclxuICAgIHJlcGxhY2VHcm91cE5hbWUoaWQ6IG51bWJlciwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBOYW1lTGlzdC5nZXQoaWQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5zZXQoaWQsIG5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bnu4TlkI3np7BcclxuICAgICAqL1xyXG4gICAgZ2V0R3JvdXBOYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBuOnN0cmluZyA9ICcnO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5mb3JFYWNoKCh2YWw6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gdmFsKSBuID0gdmFsO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIG47XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgRGF0YU1hbmFnZXIgZnJvbSBcIi4vRGF0YU1hbmFnZXJcIjtcclxuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XHJcblxyXG4vKipcclxuICog55WM6Z2i6YC76L6RXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3TG9naWMge1xyXG5cclxuICAgIC8qKiDkuIrkvKDmjInpkq4gKi9cclxuICAgIHByaXZhdGUgYnJvd3NlQnRuOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgLyoqIOe7hOWQjeensOWIl+ihqOiKgueCuSAqL1xyXG4gICAgcHJpdmF0ZSBncm91cExpc3ROb2RlOiBKUXVlcnk8SFRNTEVsZW1lbnQ+O1xyXG4gICAgLyoqIOa3u+WKoOe7hOaMiemSriAqL1xyXG4gICAgcHJpdmF0ZSBhZGRHcm91cEJ0bjogSlF1ZXJ5PEhUTUxFbGVtZW50PjtcclxuICAgIC8qKiDmiJHnmoTmlbDmja7liJfooaggKi9cclxuICAgIHByaXZhdGUgbXlMaXN0Tm9kZTogSlF1ZXJ5PEhUTUxFbGVtZW50PjtcclxuICAgIC8qKiDmoLnnm67lvZXliJfooajoioLngrkgKi9cclxuICAgIHByaXZhdGUgcm9vdExpc3Q6IEpRdWVyeTxIVE1MRWxlbWVudD47XHJcblxyXG5cclxuICAgIC8qKiDmlbDmja7nrqHnkIYgKi9cclxuICAgIHByaXZhdGUgZGF0YU1hbmFnZXI6IERhdGFNYW5hZ2VyO1xyXG4gICAgLyoqIOW9k+WJjemAieaLqeeahOWIhue7hGlkICovXHJcbiAgICBwcml2YXRlIGN1ckdyb3VwSWQ6IG51bWJlcjtcclxuICAgIC8qKiDpu5jorqTnu4QgKi9cclxuICAgIHByaXZhdGUgaW5pdEdyb3VwOiBzdHJpbmc7XHJcbiAgICAvKiogaGludOWumuaXtuWZqCAqL1xyXG4gICAgcHJpdmF0ZSBoaW50VGltZTogYW55O1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0R3JvdXAgPSAnaW5pdCc7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YU1hbmFnZXIgPSBuZXcgRGF0YU1hbmFnZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5icm93c2VCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnJvd3NlJykgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUgPSAkKCcjZ3JvdXBMaXN0Tm9kZScpO1xyXG4gICAgICAgIHRoaXMuYWRkR3JvdXBCdG4gPSAkKCcjYWRkR3JvdXBCdG4nKTtcclxuICAgICAgICB0aGlzLm15TGlzdE5vZGUgPSAkKCcjbXlMaXN0Tm9kZScpO1xyXG4gICAgICAgIHRoaXMucm9vdExpc3QgPSAkKCcjcm9vdExpc3QnKTtcclxuXHJcbiAgICAgICAgLy/mt7vliqDmoLnnm67lvZXotYTmupDngrnlh7vkuovku7ZcclxuICAgICAgICB0aGlzLmJyb3dzZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZTogRXZlbnQpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmaWxlOiBhbnkgPSAodGhpcy5icm93c2VCdG4uZmlsZXMgYXMgRmlsZUxpc3QpLml0ZW0oMCkgYXMgRmlsZTtcclxuICAgICAgICAgICAgaWYgKGZpbGUudHlwZSA9PT0gXCJhcHBsaWNhdGlvbi9qc29uXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvL+iOt+WPlui1hOa6kOagueebruW9lVxyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IGZpbGUucGF0aDtcclxuICAgICAgICAgICAgICAgIGxldCBwYXRoQXJyOiBhbnlbXSA9IHBhdGguc3BsaXQoJ1xcXFwnKTtcclxuICAgICAgICAgICAgICAgIHBhdGhBcnIuc3BsaWNlKHBhdGhBcnIubGVuZ3RoIC0gMiwgMik7XHJcbiAgICAgICAgICAgICAgICBsZXQgcm9vdFBhdGg6IHN0cmluZyA9IHBhdGhBcnIuam9pbignLycpICsgJy9hc3NldHMvcmVzb3VyY2VzJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRSb290UGF0aChyb290UGF0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy/pqozor4HmoLnnm67lvZXmmK/lkKblrZjlnKhcclxuICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHJvb3RQYXRoKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YU1hbmFnZXIucm9vdCA9IHJvb3RQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZERpcihyb290UGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3Um9vdExpc3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy/mo4DmtYvlr7zlhaXnmoRqc29u5paH5Lu25YaF5a65XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc0RhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZS5wYXRoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNEYXRhLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNEYXRhID0gSlNPTi5wYXJzZShyZXNEYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2pzb27mlofku7bkuLrnqbonKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRHcm91cCh0aGlzLmluaXRHcm91cCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdyb290IHBhdGggaXMgZXJyb3IhJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJvb3RQYXRoKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoJ1RoZSBmb3JtYXQgbXVzdCBiZSBKU09OIScpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gdGhpcy5zZXRSb290UGF0aChmaWxlKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhmaWxlKTtcclxuICAgICAgICB9KVxyXG5cclxuXHJcbiAgICAgICAgLy/mt7vliqDnu4RcclxuICAgICAgICB0aGlzLmFkZEdyb3VwQnRuLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRHcm91cCgnR3JvdXBOYW1lJyArIHRoaXMuZGF0YU1hbmFnZXIuZ3JvdXBMaXN0LnNpemUsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUuZmluZCgnaW5wdXQnKS5mb2N1cygpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIOe7hOWQjeensOeCueWHu+S6i+S7tlxyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZS5vbignY2xpY2snLCAnZGQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5jdXJyZW50VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MoJ2N1cicpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2N1cicpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkID0gTnVtYmVyKGUuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJHcm91cElkICE9PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0J5R3JvdXBJZExpc3QoaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VyR3JvdXBJZCA9IGlkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAvL+S/ruaUueWQjeensOWPjOWHu+S6i+S7tlxyXG4gICAgICAgIGxldCBjdXJWYWw6IGFueTtcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUub24oJ2RibGNsaWNrJywgJy5yZXBsYWNlR3JvdXBOYW1lJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlucHV0ID0gJChlLmN1cnJlbnRUYXJnZXQpLmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5wcm9wKCdkaXNhYmxlZCcsICcnKTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICBjdXJWYWwgPSBpbnB1dC52YWwoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUub24oJ2ZvY3Vzb3V0IGJsdXInLCAnaW5wdXQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgLy8gJChlLmN1cnJlbnRUYXJnZXQpLm9mZigpO1xyXG4gICAgICAgICAgICBsZXQgdmFsOiBhbnkgPSAkKGUuY3VycmVudFRhcmdldCkudmFsKCk7XHJcbiAgICAgICAgICAgIGlmICh2YWwubWF0Y2goL15bQS16XS8pICYmICF2YWwubWF0Y2goL1teQS16MC05XFxfXS8pKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnMTIzMTIzMuWPr+S7peW8gOWniycpXHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLnZhbChjdXJWYWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaW50KCflhoXlrrnlv4Xpobvku6XlrZfmr43lvIDlpLTvvIzpmaTkuoZf5LiN5Y+v5Lul5pyJ5YW25a6D54m55q6K5a2X56ymIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCQoZS5jdXJyZW50VGFyZ2V0KS52YWwoKSlcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL+agueebruW9leWIl+ihqOeCueWHu+S6i+S7tj09PuWPjOWHu1xyXG4gICAgICAgIHRoaXMucm9vdExpc3Qub24oJ2RibGNsaWNrJywgJ2RkJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGREYXRhTGlzdChlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDkuIDmnaHmlbDmja7liLDmlbDmja7liJfooahcclxuICAgICAqIEBwYXJhbSBpZCDotYTmupBpZFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFkZERhdGFMaXN0KGlkOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgcm9vdERhdGEgPSB0aGlzLmRhdGFNYW5hZ2VyLnJvb3RSZXNMaXN0LmdldChpZCk7Ly/ojrflj5bmoLnnm67lvZXmlbDmja5cclxuICAgICAgICBpZiAocm9vdERhdGEpIHtcclxuICAgICAgICAgICAgbGV0IG9iaiA9IHRoaXMuZGF0YU1hbmFnZXIuZ3JvdXBMaXN0LmdldCh0aGlzLmN1ckdyb3VwSWQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9iaiAmJiAhb2JqLmdldChpZCkpIHtcclxuICAgICAgICAgICAgICAgIG9iai5zZXQoaWQsIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNOYW1lOiByb290RGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHJvb3REYXRhLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogcm9vdERhdGEucGF0aFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdJdGVtKG9iai5nZXQoaWQpISk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5riy5p+T5LiA5p2h5pWw5o2u5Yiw5YmN56uvXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZHJhd0l0ZW0ob2JqOiByZXNPYmopIHtcclxuICAgICAgICAvL+e7keWumuexu+Wei1xyXG4gICAgICAgIGxldCB0eXBlU3RyOiBzdHJpbmcgPSAnJztcclxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLmFsbFR5cGUuZm9yRWFjaCgodikgPT4ge1xyXG4gICAgICAgICAgICB0eXBlU3RyICs9IGA8b3B0aW9uICR7b2JqLnR5cGUgPT09IHYgPyAnc2VsZWN0ZWQnIDogJyd9PiR7dn08L29wdGlvbj5gO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm15TGlzdE5vZGUucHJlcGVuZChgPGRkIGRhdGEtaWQ9JHtvYmoucGF0aH0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImcwIHJlc05hbWVcIj4ke29iai5yZXNOYW1lfTwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJnMCByZXNUeXBlIHNlbGVjdCBpcy1zbWFsbFwiPlxyXG4gICAgICAgICAgICA8c2VsZWN0PiR7dHlwZVN0cn08L3NlbGVjdD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZzFcIj4ke29iai5wYXRofTwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJnMCBhbm5vdGF0aW9uXCI+XHJcbiAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImlucHV0IGlzLXNtYWxsXCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIiR7b2JqLm5vdGUgPyBvYmoubm90ZSA6ICcnfVwiIHBsYWNlaG9sZGVyPVwi5rOo6YeKXCI+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICA8L2RkPmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5YiG57uEXHJcbiAgICAgKiBAcGFyYW0gbmFtZSDnu4TlkI3lrZdcclxuICAgICAqIEBwYXJhbSB0eXBlIOaYr+WQpuWPr+S/ruaUueWSjOWIoOmZpCB0cnVlIOWPr+S/ruaUuSBmYWxzZSDkuI3lj6/kv67mlLlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhZGRHcm91cChuYW1lOiBzdHJpbmcsIHR5cGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5kYXRhTWFuYWdlci5nZXRHcm91cE5hbWUobmFtZSkpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ+WIhue7hOWQjeensOW3sue7j+WtmOWcqCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN1ckdyb3VwSWQgPSB0aGlzLmRhdGFNYW5hZ2VyLmFkZEdyb3VwKG5hbWUpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUuZmluZCgnZGQnKS5yZW1vdmVDbGFzcygnY3VyJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZS5hcHBlbmQoYDxkZCBkYXRhLWlkPSR7dGhpcy5jdXJHcm91cElkfSBjbGFzcz1cInRhZyBnMSBpcy13aGl0ZSBjdXIgJHt0eXBlID8gJ3JlcGxhY2VHcm91cE5hbWUnIDogJyd9XCI+XHJcbiAgICAgICAgPGlucHV0ICBkaXNhYmxlZCBjbGFzcz1cImlucHV0IGlzLXNtYWxsIGdyb3VwTmFtZVwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJHcm91cCBuYW1lXCIgdmFsdWU9XCIke25hbWV9XCI+XHJcbiAgICAgICAgJHt0eXBlID8gJyA8YnV0dG9uIGNsYXNzPVwiZGVsZXRlIGlzLXNtYWxsXCI+PC9idXR0b24+JyA6ICcnfVxyXG4gICAgPC9kZD5gKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3QnlHcm91cElkTGlzdCh0aGlzLmN1ckdyb3VwSWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u57uE5pWw5o2u5riy5p+TXHJcbiAgICAgKiBAcGFyYW0gaWQg57uEaWRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcmF3QnlHcm91cElkTGlzdChpZDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGxpc3QgPSB0aGlzLmRhdGFNYW5hZ2VyLmdyb3VwTGlzdC5nZXQoaWQpO1xyXG4gICAgICAgIGlmIChsaXN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubXlMaXN0Tm9kZS5odG1sKCcnKTtcclxuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKCh2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0l0ZW0odmFsKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGlzdClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmuIXpmaTliJfooajliJ3lp4vljJbnrYlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjbGVhcigpIHtcclxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLnJvb3RSZXNMaXN0LmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLmh0bWwoJycpO1xyXG4gICAgICAgIHRoaXMubXlMaXN0Tm9kZS5odG1sKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruagueebruW9lei3r+W+hFxyXG4gICAgICogQHBhcmFtIHBhdGgg6Lev5b6EXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2V0Um9vdFBhdGgocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IHJvb3ROb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jvb3ROb2RlJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICAgICAgcm9vdE5vZGUuaW5uZXJUZXh0ID0gcGF0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa4suafk+agueaWh+S7tuaJgOaciei1hOa6kFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRyYXdSb290TGlzdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmRhdGFNYW5hZ2VyLnJvb3RSZXNMaXN0KVxyXG4gICAgICAgIGxldCBodG1sID0gJycsXHJcbiAgICAgICAgICAgIGxpc3QgPSB0aGlzLmRhdGFNYW5hZ2VyLnJvb3RSZXNMaXN0O1xyXG5cclxuICAgICAgICBsaXN0LmZvckVhY2goKHZhbCwga2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gYDxkZCBkYXRhLWlkPSR7a2V5fSBkYXRhLXR5cGU9JHt2YWwudHlwZX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZzAgcmVzTmFtZVwiPiR7dmFsLm5hbWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZzAgcmVzVHlwZVwiPiR7dmFsLnR5cGV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZzFcIj4ke3RoaXMuZGF0YU1hbmFnZXIucm9vdCArIHZhbC5wYXRofSA8YSBjbGFzcz1cImRlbGV0ZSBpcy1zbWFsbFwiPjwvYT48L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnMCBzaXplX21lXCI+JHt0aGlzLmNvbnZlcnRGaWxlU2l6ZSh2YWwuc2l6ZSl9PC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGQ+YFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMucm9vdExpc3QuaHRtbChodG1sKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOivu+WPluebruW9leaJgOaciei1hOa6kFxyXG4gICAgICogQHBhcmFtIHBhdGgg6Lev5b6EXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVhZERpcihwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwYXRoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeCA9IGZpbGVzLmxlbmd0aCAtIDE7IHggPiAtMTsgeC0tKSB7XHJcbiAgICAgICAgICAgIGlmIChmaWxlc1t4XS5pbmRleE9mKCcubWV0YScpID09PSAtMSkgey8v5o6S6ZmkLm1hdGXmlofku7ZcclxuICAgICAgICAgICAgICAgIGxldCBzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGggKyAnLycgKyBmaWxlc1t4XSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkgey8v55uu5b2VXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkRGlyKHBhdGggKyAnLycgKyBmaWxlc1t4XSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRzLmlzRmlsZSgpKSB7Ly/mmK/mlofku7ZcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGZpbGVzW3hdLnJlcGxhY2UoJ18nLCAnJykuc3BsaXQoJy4nKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLmFsbFR5cGUuYWRkKG5hbWVbMV0pOy8v6YeN5aSN5LiA55u05re75Yqg57G75Z6LIOS/neivgeexu+Wei+WUr+S4gOaAp1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbXlQYXRoID0gKHBhdGggKyAnLycgKyBmaWxlc1t4XSkucmVwbGFjZSh0aGlzLmRhdGFNYW5hZ2VyLnJvb3QgKyAnJywgJycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YU1hbmFnZXIucm9vdFJlc0xpc3Quc2V0KG15UGF0aCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLmpvaW4oJ18nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogbXlQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBuYW1lWzFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiBzdGF0cy5zaXplXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKiDmlofku7blpKflsI/lgLzovazmjaIgKi9cclxuICAgIHByaXZhdGUgY29udmVydEZpbGVTaXplKHNpemU6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgc2l6ZSA9IHNpemUgLyAxMDAwO1xyXG4gICAgICAgIGlmIChzaXplIDwgMTAyNCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2l6ZS50b0ZpeGVkKDIpICsgJ0tCJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzaXplID0gc2l6ZSAvIDEwMDA7XHJcbiAgICAgICAgICAgIHJldHVybiBzaXplLnRvRml4ZWQoMikgKyAnTUInO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaPkOekulxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGhpbnQoc3RyOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgaGludFZpZXcgPSAkKCcjaGludFZpZXcnKTtcclxuICAgICAgICBoaW50Vmlldy5zaG93KCk7XHJcbiAgICAgICAgaGludFZpZXcudGV4dChzdHIpO1xyXG4gICAgICAgIGlmICh0aGlzLmhpbnRUaW1lKSBjbGVhclRpbWVvdXQodGhpcy5oaW50VGltZSk7XHJcbiAgICAgICAgdGhpcy5oaW50VGltZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBoaW50Vmlldy5mYWRlT3V0KDMwMCk7XHJcbiAgICAgICAgfSwgMjAwMClcclxuICAgIH1cclxufSJdLCJuYW1lcyI6WyJEYXRhTWFuYWdlciIsIltvYmplY3QgT2JqZWN0XSIsInRoaXMiLCJncm91cElkIiwicm9vdFJlc0xpc3QiLCJNYXAiLCJncm91cExpc3QiLCJhbGxUeXBlIiwiU2V0IiwiZ3JvdXBOYW1lTGlzdCIsIm5hbWUiLCJzZXQiLCJpZCIsImdyb3VwIiwiZ2V0Iiwic2l6ZSIsImRlbGV0ZSIsIm4iLCJmb3JFYWNoIiwidmFsIiwiVmlld0xvZ2ljIiwiaW5pdEdyb3VwIiwiZGF0YU1hbmFnZXIiLCJicm93c2VCdG4iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJncm91cExpc3ROb2RlIiwiJCIsImFkZEdyb3VwQnRuIiwibXlMaXN0Tm9kZSIsInJvb3RMaXN0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJmaWxlIiwiZmlsZXMiLCJpdGVtIiwidHlwZSIsInBhdGgiLCJwYXRoQXJyIiwic3BsaXQiLCJzcGxpY2UiLCJsZW5ndGgiLCJyb290UGF0aCIsImpvaW4iLCJzZXRSb290UGF0aCIsImZzLmV4aXN0c1N5bmMiLCJjbGVhciIsInJvb3QiLCJyZWFkRGlyIiwiZHJhd1Jvb3RMaXN0IiwicmVzRGF0YSIsImZzLnJlYWRGaWxlU3luYyIsInRvU3RyaW5nIiwiSlNPTiIsInBhcnNlIiwiY29uc29sZSIsImxvZyIsImFkZEdyb3VwIiwiYWxlcnQiLCJvbiIsImZpbmQiLCJmb2N1cyIsImN1cnJlbnRUYXJnZXQiLCJhZGRDbGFzcyIsInNpYmxpbmdzIiwicmVtb3ZlQ2xhc3MiLCJOdW1iZXIiLCJnZXRBdHRyaWJ1dGUiLCJjdXJHcm91cElkIiwiZHJhd0J5R3JvdXBJZExpc3QiLCJjdXJWYWwiLCJpbnB1dCIsInByb3AiLCJhdHRyIiwibWF0Y2giLCJoaW50IiwiYWRkRGF0YUxpc3QiLCJyb290RGF0YSIsIm9iaiIsInJlc05hbWUiLCJkcmF3SXRlbSIsInR5cGVTdHIiLCJ2IiwicHJlcGVuZCIsImxpc3QiLCJzdGF0cyIsIngiXSwibWFwcGluZ3MiOiIwTkFLcUJBLEdBZ0JqQkMsY0FDSUMsS0FBS0MsUUFBVSxFQUNmRCxLQUFLRSxZQUFjLEdBQUlDLEtBQ3ZCSCxLQUFLSSxVQUFZLEdBQUlELEtBQ3JCSCxLQUFLSyxRQUFVLEdBQUlDLEtBQ25CTixLQUFLTyxjQUFnQixHQUFJSixLQVE3QkosU0FBU1MsR0FJTCxNQUhBUixNQUFLQyxVQUNMRCxLQUFLSSxVQUFVSyxJQUFJVCxLQUFLQyxRQUFTLEdBQUlFLE1BQ3JDSCxLQUFLTyxjQUFjRSxJQUFJVCxLQUFLQyxRQUFTTyxHQUM5QlIsS0FBS0MsUUFPaEJGLFdBQVdXLEdBQ1AsR0FBSUMsR0FBUVgsS0FBS0ksVUFBVVEsSUFBSUYsRUFFMUJDLElBRURBLEVBQU1FLE9BQ05iLEtBQUtJLFVBQVVVLE9BQU9KLEdBQ3RCVixLQUFLTyxjQUFjTyxPQUFPSixJQVNsQ1gsaUJBQWlCVyxFQUFZRixHQUN6QixNQUFJUixNQUFLTyxjQUFjSyxJQUFJRixJQUN2QlYsS0FBS08sY0FBY0UsSUFBSUMsRUFBSUYsR0FDcEJBLEdBRUosS0FNWFQsYUFBYVMsR0FDVCxHQUFJTyxHQUFXLEVBSWYsT0FIQWYsTUFBS08sY0FBY1MsUUFBUSxBQUFDQyxJQUNwQlQsSUFBU1MsSUFBS0YsRUFBSUUsS0FFbkJGLFFDdkVNRyxHQXdCakJuQixjQUVJQyxLQUFLbUIsVUFBWSxPQUVqQm5CLEtBQUtvQixZQUFjLEdBQUl0QixHQUV2QkUsS0FBS3FCLFVBQVlDLFNBQVNDLGNBQWMsV0FDeEN2QixLQUFLd0IsY0FBZ0JDLEVBQUUsa0JBQ3ZCekIsS0FBSzBCLFlBQWNELEVBQUUsZ0JBQ3JCekIsS0FBSzJCLFdBQWFGLEVBQUUsZUFDcEJ6QixLQUFLNEIsU0FBV0gsRUFBRSxhQUdsQnpCLEtBQUtxQixVQUFVUSxpQkFBaUIsU0FBVSxBQUFDQyxJQUV2QyxHQUFJQyxHQUFhL0IsS0FBS3FCLFVBQVVXLE1BQW1CQyxLQUFLLEVBQ3hELElBQWtCLHFCQUFkRixFQUFLRyxLQUE2QixDQUdsQyxHQUFJQyxHQUFlSixFQUFLSSxLQUNwQkMsRUFBaUJELEVBQUtFLE1BQU0sS0FDaENELEdBQVFFLE9BQU9GLEVBQVFHLE9BQVMsRUFBRyxFQUNuQyxJQUFJQyxHQUFtQkosRUFBUUssS0FBSyxLQUFPLG1CQUkzQyxJQUhBekMsS0FBSzBDLFlBQVlGLEdBR2JHLGFBQWNILEdBQVcsQ0FFekJ4QyxLQUFLNEMsUUFFTDVDLEtBQUtvQixZQUFZeUIsS0FBT0wsRUFDeEJ4QyxLQUFLOEMsUUFBUU4sR0FDYnhDLEtBQUsrQyxjQUdMLElBQUlDLEdBQVVDLGVBQWdCbEIsRUFBS0ksTUFBTWUsVUFDckNGLEdBQVFULE9BQ1JTLEVBQVVHLEtBQUtDLE1BQU1KLElBR3JCSyxRQUFRQyxJQUFJLFlBQ1p0RCxLQUFLdUQsU0FBU3ZELEtBQUttQixXQUFXLFFBSWxDcUMsT0FBTSxzQkFFVkgsU0FBUUMsSUFBSWQsT0FFWmdCLE9BQU0sMkJBR1ZILFNBQVFDLElBQUl2QixLQUtoQi9CLEtBQUswQixZQUFZK0IsR0FBRyxhQUNoQnpELEtBQUt1RCxTQUFTLFlBQWN2RCxLQUFLb0IsWUFBWWhCLFVBQVVTLE1BQU0sRUFDN0RiLE1BQUt3QixjQUFja0MsS0FBSyxTQUFTQyxVQUlyQzNELEtBQUt3QixjQUFjaUMsR0FBRyxRQUFTLEtBQU0sQUFBQzNCLElBQ2xDLEdBQUlBLEVBQUU4QixjQUFlLENBQ2pCbkMsRUFBRUssRUFBRThCLGVBQWVDLFNBQVMsT0FBT0MsV0FBV0MsWUFBWSxNQUMxRCxJQUFJckQsR0FBS3NELE9BQU9sQyxFQUFFOEIsY0FBY0ssYUFBYSxXQUN6Q2pFLE1BQUtrRSxhQUFleEQsSUFDcEJWLEtBQUttRSxrQkFBa0J6RCxHQUN2QlYsS0FBS2tFLFdBQWF4RCxLQUs5QixJQUFJMEQsRUFDSnBFLE1BQUt3QixjQUFjaUMsR0FBRyxXQUFZLG9CQUFxQixBQUFDM0IsSUFDcEQsR0FBSUEsRUFBRThCLGNBQWUsQ0FDakIsR0FBSVMsR0FBUTVDLEVBQUVLLEVBQUU4QixlQUFlRixLQUFLLFFBQ3BDVyxHQUFNQyxLQUFLLFdBQVksSUFDdkJELEVBQU1WLFFBQ05TLEVBQVNDLEVBQU1wRCxTQUt2QmpCLEtBQUt3QixjQUFjaUMsR0FBRyxnQkFBaUIsUUFBUyxBQUFDM0IsSUFDN0NMLEVBQUVLLEVBQUU4QixlQUFlVyxLQUFLLFdBQVksV0FFcEMsSUFBSXRELEdBQVdRLEVBQUVLLEVBQUU4QixlQUFlM0MsS0FDOUJBLEdBQUl1RCxNQUFNLFlBQWN2RCxFQUFJdUQsTUFBTSxlQUNsQ25CLFFBQVFDLElBQUksZ0JBR1o3QixFQUFFSyxFQUFFOEIsZUFBZTNDLElBQUltRCxHQUN2QnBFLEtBQUt5RSxLQUFLLDRCQUVkcEIsU0FBUUMsSUFBSTdCLEVBQUVLLEVBQUU4QixlQUFlM0MsU0FJbkNqQixLQUFLNEIsU0FBUzZCLEdBQUcsV0FBWSxLQUFNLEFBQUMzQixJQUM1QkEsRUFBRThCLGVBQ0Y1RCxLQUFLMEUsWUFBWTVDLEVBQUU4QixjQUFjSyxhQUFhLGNBVWxEbEUsWUFBWVcsR0FDaEIsR0FBSWlFLEdBQVczRSxLQUFLb0IsWUFBWWxCLFlBQVlVLElBQUlGLEVBQ2hELElBQUlpRSxFQUFVLENBQ1YsR0FBSUMsR0FBTTVFLEtBQUtvQixZQUFZaEIsVUFBVVEsSUFBSVosS0FBS2tFLFdBRTFDVSxLQUFRQSxFQUFJaEUsSUFBSUYsS0FDaEJrRSxFQUFJbkUsSUFBSUMsR0FDSm1FLFFBQVNGLEVBQVNuRSxLQUNsQjBCLEtBQU15QyxFQUFTekMsS0FDZkMsS0FBTXdDLEVBQVN4QyxPQUVuQm5DLEtBQUs4RSxTQUFTRixFQUFJaEUsSUFBSUYsTUFTMUJYLFNBQVM2RSxHQUViLEdBQUlHLEdBQWtCLEVBQ3RCL0UsTUFBS29CLFlBQVlmLFFBQVFXLFFBQVEsQUFBQ2dFLElBQzlCRCxjQUFzQkgsRUFBSTFDLE9BQVM4QyxFQUFJLFdBQWEsTUFBTUEsZUFHOURoRixLQUFLMkIsV0FBV3NELHVCQUF1QkwsRUFBSXpDLDJZQTZCbEMzQixLQUNMLCtDQUVBZ0QsdWFBYUNXLCtGQVNEZSxLQUNBbEYseUJBQ0FrRix5TEF1QnNDLDhWQW1CSHJDLHFIQUVZNUIsRUFBSUosOEdBZWxELHlHQU1lYixpQ0FFSG1GLGVBQ0QzRSxHQUFPd0IsRUFBTW9ELDZKQUdiNUUsc0VBWWhCLGNBQUlLLGlCQUNvQiJ9
