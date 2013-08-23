/*global _, $, jQuery */
/*jshint bitwise:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, undef:true,
	trailing:true, smarttabs:true, sub:true, browser:true, devel:true, maxlen:150 */
;(function(window, undefined){
    var document = window.document;
    var slice = Array.prototype.slice;
    var _ = window['_'];
    if (!_) return;
    /**
     * underscore 扩展工厂，与原有的_.extend有区别
     * @param   {[object]}  objA         [只有一个参数时，扩展该对象的属性至父对象]
     * @param   {[object]}  objB - objN  [超过一个参数时，扩展除第一个参数外的对象属性至第一个对象]
     * @param   {[boolean]} overwrite   [当最后一个参数是bool类型时，表示扩展时遇到相同名称的属性，是否执行覆盖操作]
     * @return  {[object]}           [返回扩展后的对象]
     */
    _.mix = function() {
        var target = arguments[0];
        var length = arguments.length;
        var overwrite = false;
        var i = 1;
        var source;
        var name;
        var copy;
        if (_.isBoolean(arguments[length-1])) {
            overwrite = arguments[length-1];
            length--;
        }
        if (length === i) {
            target = this;
            i = 0;
        }
        if (!_.isObject(target) && !_.isFunction(target)) { target = {}; }
        for(;i < length;i++){
            if(source = arguments[i]){
                for(name in source) {
                    copy = source[name];
                    if (target === copy) { continue; }
                    if (copy && (overwrite || !(name in target))) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    _.mix({
        /**
         * 命名空间管理
         * @param  {[string]}           ns          [命名空间的完整路径]
         * @param  {[object/function]}  property    [需要给命名空间扩展的属性集合，或函数]
         * @return {[object]}                       [返回命名空间]
         */
        ns: function(ns, property) {
            if (typeof ns === 'string') {
                var nss = ns.split('.');
                var parent = window;
                if (ns.charAt(0) === '.') {
                    nss.shift();
                }
                while (ns = nss.shift()) {
                    parent[ns] = parent[ns] || {};
                    parent = parent[ns];
                }
                if (_.isFunction(property)) {
                    property.call(parent);
                } else if (_.isObject(property)) {
                    _.mix(parent, property);
                }
                return parent;
            }
            return ns;
        },
        /**
         * 创建一个类Class
         * @param  {[object]} property [类的原型属性和方法]
         * @return {[object]}          [返回该类]
         */
        newClass: function() {
            var fn = function(){
                if (_.isFunction(this.initialize)) this.initialize.apply(this, arguments);
            };
            var args = Array.prototype.slice.apply(arguments);
            args.unshift(fn.prototype);
            _.extend.apply(this, args);
            return fn;
        },
        /**
         * 测试回调
         * @param  {[function]} fnCondition [测试函数]
         * @param  {[function]} fnCallback  [回调函数]
         * @return {[undefined]}            [description]
         */
        wait: function(fnCondition, fnCallback) {
            if (_.isFunction(fnCondition) && _.isFunction(fnCallback)) {
                async.waitList.push([fnCondition, fnCallback]);
                if (async.waitList.length === 1) {
                    async.waitLoop();
                }
            }
        },
        /**
         * 执行一个函数
         * @param  {Function} fn [description]
         * @return {[type]}      [description]
         */
        fire:function(fn){
            if(_.isFunction(fn)){
                var args = [].slice.call(arguments, 1);
                return fn.apply(window, args);
            }
        },
        /**
         * 执行一个函数，无需判断fn是否为函数，并可传入参数
         * @param  {Function} fn     [description]
         * @param  {[type]}   target [description]
         * @return {[type]}          [description]
         */
        fireWith:function(fn, target){
            if(_.isFunction(fn)){
                var args = [].slice.call(arguments, 2);
                return fn.apply(target, args);
            }
        },
        /**
         * 生成一个GUID
         * @return {[type]} [description]
         */
        getRandGuid:function(){
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        },
        nsTest:function(ns, fn){
            if(typeof ns === 'string'){
                var nss = ns.split('.');
                var parent = window;
                var flag = true;
                if (ns.charAt(0) === '.') {
                    nss.shift();
                }
                while (ns = nss.shift()) {
                    if(parent[ns]){
                        parent = parent[ns];
                    } else {
                        flag = false;
                        break;
                    }
                }
                _.fire(fn, flag, ns);
            }
        }
    });
    /*
    ** function _.wait
    */
    var async = {
        waitDelay: 1000,
        waitList: [],
        waitLoop: function() {
            var that = this;
            _.each(this.waitList, function (n, i) {
                var fnCondition = n[0];
                var fnCallback = n[1];
                var bSuccess = fnCondition();
                if (bSuccess) {
                    fnCallback();
                    that.waitList[i] = null;
                }
            });
            this.waitList = _.filter(this.waitList, function (n) { return n; });
            if (this.waitList.length) {
                setTimeout(function () { that.waitLoop(); }, that.waitDelay);
            }
        }
    };
    var cnWeeks = String.fromCharCode(26085, 19968, 20108, 19977, 22235, 20116, 20845);
    /**
     * _.time命名空间
     */
    _.ns('_.time', function(){
        var timeCache = {};
        var timeQueue = [];
        /**
         * 保存一个开始的时间戳
         * @param  {[string]} key   [可区分组的key值]
         * @return {[int]}          [当前时间戳]
         */
        this.start = function(key){
            var timespan = new Date().getTime();
            if(key === undefined) {
                timeQueue.push(timespan);
            } else {
                timeCache[key] = timespan;
            }
            return timespan;
        };
        /**
         * 返回时间戳的差值
         * @param  {[string]} key   [可区分组的key值]
         * @return {[int]}          [当前时间戳差值]
         */
        this.end = function(key){
            var timespan = new Date().getTime();
            if(key === undefined) {
                return timespan - timeQueue.shift();
            } else {
                return timespan - timeCache[key];
            }
        };
        /**
         * 创建一个延时循环对象
         * @param  {[int]}      delay   [延时毫秒]
         * @return {[object]}           [description]
         */
        this.create = function(delay){
            return new TimeInterval(delay);
        };
    });
    var TimeInterval = _.newClass({
        initialize: function(delay){
            this.delay = delay || 1000;
            this.isRun = false;
            this.__queue = [];
            this.__IntervalID = null;
        },
        add: function(callback){
            if(_.isArray(callback)) {
                var that = this;
                _.each(callback, function(fn){
                    that.add(fn);
                });
            } else if(_.isFunction(callback)) {
                this.__queue.push(callback);
                if(!this.isRun) this.start();
            }
            return this;
        },
        start: function(){
            var that = this;
            if(this.__queue.length) {
                this.isRun = true;
                this.__IntervalID = setInterval(function(){
                    if(that.fire() === false) { that.stop(); }
                }, this.delay);
            }
            return this;
        },
        stop:function(){
            clearInterval(this.__IntervalID);
            this.__IntervalID = null;
            this.isRun = false;
            return this;
        },
        fire: function(){
            var q = this.__queue;
            var f, i = 0, signRun = true, tmpResult = true;
            var args = arguments;
            while(f = q[i++]) {
                tmpResult = f.apply(this, args);
                signRun = signRun || (tmpResult !== false);
            }
            return signRun;
        }
    });
    /*
    ** namespace _.support
    */
    _.ns('_.support', {
        event: function () {
            var eventCache = {};
            return function(eventName) {
                eventName = /^on[\w]+/i.test(eventName) ? '' : 'on' + eventName.toLowerCase();
                if (typeof eventCache[eventName] !== 'undefined') return eventCache[eventName];
                var el = document.createElement('div');
                var isSupported = (eventName in el);
                if (!isSupported) {
                    el.setAttribute(eventName, 'return;');
                    isSupported = typeof el[eventName] === 'function';
                    el.removeAttribute(eventName);
                }
                return eventCache[eventName] = isSupported;
            };
        }(),
        input: { }
    });
    (function(prop) {
        var supInput = _.support.input;
        var input = document.createElement('input');
        _.each(prop, function(p) {
            supInput[p] = (p in input);
        });
    }('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' ')));
    /*
    ** namespace _.str
    */
    _.ns('_.str', {
        tmpBuffer: function(text) {
            var obj = new TmpBuffer();
            if (typeof text !== 'undefined') obj.add.apply(obj, arguments);
            return obj;
        },
        rmb: '\xA5',
        autoPriceHTML:function(n){
            var rmb = this.rmb;
            return [n < 0 ? '- ' : '', '<samp>', rmb,
                '<\/samp> ', '<span>',
                    parseFloat(n).toString().replace(/(\d+)(?=(\d{3})+[\.]?)/g, '$1,'),
                '<\/span>'
            ].join('');
        },
        fullPriceHTML: function(n) {
            var rmb = this.rmb;
            return [
                (n < 0 ? '- ' : ''),
                '<samp>',
                    rmb,
                '<\/samp> ', '<span>',
                    Math.abs(n).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
                '<\/span>'
            ].join('');
        },
        priceToNumber: function(s) {
            return s ? parseFloat(s.replace(/\,/g, '').replace(/\-\s+/, '-')) : 0;
        },
        replaceVar: function(sTemplate, sVar, s) {
            if (sTemplate && sVar && s && this.include(sTemplate, sVar)) {
                var a = sTemplate.split(sVar);
                var aOutput = [a[0], s, a[1]];
                return aOutput.join('');
            }
            return false;
        },
        dateFormat: function(date, fmt) {
            if (!_.isDate(date)) {
                fmt = date;
                date = new Date();
            }
            var d = {
                'M': date.getMonth() + 1,
                'd': date.getDate(),
                'H': date.getHours(),
                'm': date.getMinutes(),
                's': date.getSeconds()
            };
            var k;
            if (_.isFunction(fmt)) {
                for (k in d) {
                    d[k+k] = ('00' + d[k]).slice(-2);
                }
                d['yy'] = String(d['yyyy'] = date.getFullYear()).slice(-2);
                d['S'] = date.getMilliseconds();
                d['W'] = cnWeeks.charAt(d['w'] = date.getDay());
                return fmt.call(d);
            } else {
                d['S'] = date.getMilliseconds();
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4-RegExp.$1.length));
                }
                if (/(w)/i.test(fmt)) {
                    k = date.getDay();
                    fmt = fmt.replace(RegExp.$1, RegExp.$1=='w'?k:cnWeeks.charAt(k));
                }
                for (k in d) {
                    if (new RegExp('(' + k + '+)').test(fmt)) {
                        k = d[k] + '';
                        fmt = fmt.replace(RegExp.$1, RegExp.$1.length==1?k:('00'+k).substr(k.length));
                    }
                }
                return fmt;
            }
        }
    });
    /*
    ** function _.str.tmpBuffer
    */
    var TmpBuffer = _.newClass({
        initialize: function() { 
            this._list = [];
            this.toString = this.valueOf = function() { return this.join('') };
        },
        add: function() {
            var l = this._list;
            l.push.apply(l, arguments);
            return this;
        },
        join: function(chr) {
            var l = this._list;
            var text = '';
            chr = typeof chr === 'undefined' ? text : (chr||text);
            if(ua.isIE6){
                text = l.join(chr);
            }else{
                _.each(l, function(s){ text = text + chr + s; });
                text = text.slice(chr.length);
            }
            return text;
        },
        clear: function() {
            this._list.length = 0;
            return this;
        }
    });
    /*
    ** namespace _.regexp
    */
    _.ns('_.regexp', {
        Email: /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i,
        Mobile: /^1[358]\d{9}$/,
        PostCode: /^\d{6}$/
    });
    /*
    ** namespace _.config(fix localStorage)
    */
    var localStorage = window.localStorage;
    (function() {
        if (typeof localStorage === 'undefined') {
            var name = 'userDateFixStorage';
            var fixStorage = function() {
                var storageOwner;
                var storageContainer;
                var storage;
                try {
                    storageContainer = new ActiveXObject('htmlfile');
                    storageContainer.open();
                    storageContainer.write('<s' + 'cript>document.w=window</s' + 'cript><iframe src="/favicon.ico"></frame>');
                    storageContainer.close();
                    storageOwner = storageContainer.w.frames[0].document;
                    storage = storageOwner.createElement('div');
                } catch(e) { 
                    storageOwner = document.body;
                    storage = document.createElement('div');
                }
                return function(fn) {
                    storageOwner.appendChild(storage);
                    storage.addBehavior('#default#userData');
                    storage.load(name);
                    var result = fn(storage);
                    storageOwner.removeChild(storage);
                    return result;
                };
            }();
            window.localStorage = localStorage = {
                setItem: function(sKey, sValue) {
                    fixStorage(function(dom) {
                        dom.setAttribute(sKey, sValue);
                        dom.save(name);
                    });
                },
                getItem: function(sKey) {
                    return fixStorage(function(dom) {
                        return dom.getAttribute(sKey);
                    });
                },
                removeItem: function(sKey) {
                    fixStorage(function(dom) {
                        dom.removeAttribute(sKey);
                        dom.save(name);
                    });
                },
                clear: function() {
                    fixStorage(function(dom) {
                        var attributes = dom.XMLDocument.documentElement.attributes;
                        for (var i=0, attr; attr=attributes[i]; i++) {
                            dom.removeAttribute(attr.name);
                        }
                        dom.save(name);
                    });
                }
            };
        }
    }());
    _.ns('_.config', {
        set: function(sKey, sValue) {
            if (_.isString(sKey)) {
                localStorage.setItem(sKey, String(sValue));
            }
        },
        get: function(sKey) {
            if (_.isString(sKey)) {
                return localStorage.getItem(sKey);
            } else {
                return null;
            }
        },
        remove: function(sKey) {
            if (_.isString(sKey)) {
                localStorage.removeItem(sKey);
            }
        },
        clear: function() {
            localStorage.clear();
        }
    });
    /*
    ** namespace _.url
    */
    var location = window.location;
    var url_param = null;
    var url = _.ns('_.url', {
        host: location.hostname.toLowerCase(),
        path: location.pathname,
        query: location.search.slice(1).replace(/&+$/, ''),
        parseQuery: function(sQuery) {
            var data = {};
            sQuery = sQuery || url.query;
            if(sQuery){
                var result = sQuery.match(/[^|&]([^?&]*=[^?&]*)/g);
                if (result) {
                    _.each(result, function(v){
                        v = v.split('=');
                        data[decodeURIComponent(v[0]).toLowerCase()] = decodeURIComponent(v[1]||'');
                    });
                }
            }
            return data;
        },
        getParam: function(s) {
            if (!url_param) {
                url_param = url.parseQuery(url.query);
            }
            return url_param[(''+s).toLowerCase()] || null;
        },
        go: function(s) {
            if (_.isString(s)) {
                window.location.href = s;
            } else {
                return false;
            }
        },
        jump: function(s){
            if (_.isString(s)) {
                window.location.replace(s);
            } else {
                return false;
            }
        }
    });
    /*
    ** namespace _.ua
    */
    var UA = window.navigator.userAgent;
    var nUA = UA.toLowerCase();
    var ua = _.ns('_.ua', {
        value: UA,
        isIE6: !('1'[0]) && !window.XMLHttpRequest,
        isWebKit: _.str.include(nUA,'webkit'),
        screen: {},
        os: '',
        osVersion: ''
    });
    if (ua.isIE6) {
        try{ document.execCommand("BackgroundImageCache", false, true) }catch(e){ }
    }
    (function() {
        ua.screen.pixelRatio = window.devicePixelRatio || 1;
        //mobile os
        if (_.str.include(nUA, 'android')) {
            ua.os = 'Android';
            ua.isAndroid = true;
            ua.osVersion = (nUA.match(/[\/\(; ]android[\/: ](\d+\.\d)\d*[\.;\- ]/) || [0,'0'])[1];
        } else if (nUA.match(/\(i(?:phone|pod|pad);/)) {
            ua.os = 'iOS';
            ua.isIOS = true;
            ua.osVersion = (nUA.match(/[\/; ]os[\/: _](\d+(?:[\._]\d+)?)[\._; ]/) || [0,'0'])[1].replace('_', '.');
        }
        //screen
        if (ua.os === 'Android') {
            ua.screen.width = (window.outerWidth || 1) / ua.screen.pixelRatio;
            ua.screen.height = (window.outerHeight || 1) / ua.screen.pixelRatio;
        } else {
            ua.screen.width = screen.width || 1;
            ua.screen.height = screen.height || 1;
        }
        ua.screen.size = [ua.screen.width, ua.screen.height];
        ua.screen.longerSide = _.max(ua.screen.size);
        ua.screen.shorterSide = _.min(ua.screen.size);
        ua.screen.aspectRatio = ua.screen.longerSide / ua.screen.shorterSide;
        //apple device
        if (ua.isIOS) {
            var sPrd = '';
            if (nUA.match(/\(ipad;/)) {
                sPrd = 'iPad';
                ua.isIPad = true;
            } else if (nUA.match(/\(iphone;/)) {
                sPrd = 'iPhone';
                ua.isIPhone = true;
            } else if (nUA.match(/\(ipod;/)) {
                sPrd = 'iPod';
                ua.isIPod = true;
            }
            var sModel = ua.screen.pixelRatio > 1 ? '(HD)' : '';
            if (!ua.isIPad && ua.screen.pixelRatio > 1 && ua.screen.aspectRatio > 1.7) sModel = '(HD+)';  //16:9
            ua.appleDevice = sModel ? sPrd + ' ' + sModel : sPrd;
        }
        //summary
        if (ua.os === 'Android' || ua.os === 'iOS') {
            ua.isMobileDevice = true;
            ua.mobileDeviceType = ua.type = (ua.screen.longerSide > 640) ? 'pad' : 'phone';
            ua.osVersion += _.str.include(ua.osVersion, '.') ? '' : '.0';
        }
    }());
    /*
    ** namespace _.cookie
    ** @name
    ** @value
    ** @options:{expires:生存周期, path:路径, domain:域, secure}
    */
    var setCookie = function(name, value, options) {
        if (typeof value != 'undefined') {
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString();
            }
            var path = '; path=' + (options.path ? options.path : '/');
            var domain = '; domain=' + (options.domain ? options.domain : url.host);
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        }
    };
    _.ns('_.cookie', {
        set: function() {
            setCookie.apply(this, arguments);
        },
        get: function(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = _.str.trim(cookies[i]);
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        },
        remove: function(name, options) {
            setCookie.call(this, name, null, options);
        }
    });
}(this));
/* == UE js frames == */
;(function ($) {
    var window = this;
    var document = window.document;
    /**************************
    **  namespace UE
    **************************/
    var UE = _.ns('UE', {
        debug: false,
        log: function(){
            if (!UE.debug) { return; }
            var console = window.console;
            if (console && console.log) {
                console.log.apply(console, arguments);
            }
        },
        rootElem: document.compatMode && document.compatMode === 'CSS1Compat' ? document.documentElement : document.body,
        /**
         * 滚动条滚动至某节点位置
         * @param  {selector/jQuery}    s   [节点的选择器或jq对象]
         * @param  {number}             fix [修复滚动的位置，在节点对应的位置上减去fix]
         * @param  {Function}           fn  [滚动结束后的回调]
         * @return {[type]}                 [description]
         */
        scrollTo: function(s, fix, fn) {
            if (s && (typeof s === 'string' || s.jquery)) {
                var j = s.jquery ? s : $(s);
                if (j.length) {
                    if($.isFunction(fix)){
                        fn = fix;
                        fix = 0;
                    }
                    var top = j.offset().top - (fix || 0);
                    var duration = 300;
                    $(UE.rootScrollingElem).animate({
                        scrollTop: top
                    }, duration, 'swing', fn);
                }
            }
        },
        /**
         * 加入收藏夹
         * @param  {[type]} args [description]
         * @return {[type]}      [description]
         */
        addFavorite: function(args) {
            var params = {
                title: '优e网 - 优品生活 优e购',
                url: 'http://www.uemall.com/'
            };
            if (args) {
                $.extend(params, args);
            }
            if (window.sidebar || window.opera) {
                var sTitle = params.elem.title;
                params.elem.title = params.title;
                setTimeout(function () {
                    params.elem.title = sTitle;
                }, 500);
                return true;
            }
            try {
                window.external.addFavorite(params.url, params.title);
            } catch (e) {
                alert('请按下 Ctrl + D 键将本站加入收藏。');
            }
            return false;
        },
        /**
         * 美化弹窗提示 - 取消默认3秒自动关闭，扩展参数可定制化
         * @param  {string / object}   msg      提示消息（可传入html或者定制化的options）
         * @param  {Function} callback 回调函数（在show和hide时都调用，回调函数有一个status状态参数，1代表show，0代表hide）
         * @return {[type]}            [description]
         */
        alert:function(msg, callback){
            var str1 = '<div style="padding:60px 80px;"><table class="cmDialogLayout"><tbody><tr>';
            str1 += '<td style="width:65px;"><span class="cmDialogWarn"></span></td>';
            str1 += '<td class="cmDialogContentWrap">';
            var str2 = '</td></tr></tbody></table></div>';
            if(typeof msg === 'string'){
                UE.dialog.show({
                    id:'ue-dialog-alert',
                    type:'warn',
                    html:str1 + msg + str2,
                    callback: callback
                });
            } else {
                msg = $.extend({
                    type:'warn',
                    callback: callback
                }, msg, {id:'ue-dialog-alert'});
                msg.html = str1 + msg.html + str2;
                UE.dialog.show(msg);
            }
        },
        /**
         * 只用v2的代码，暂时未实现文本的消息提示，需要考虑下怎样的方式来显示
         */
        Validation:_.newClass({
            initialize:function(eInput, rules){
                this.$input = eInput instanceof $ ? eInput : $(eInput);
                this.rules = rules;
                this.delayCheck = false;
                this.waitingChecks = [];
                this.config();
                this.create();
                this.bind();
            },
            requiredCheck:function(){
                if (this.$input.attr('type') === 'checkbox') {
                    if (this.$input[0].checked) {
                        return true;
                    } else {
                        this.errorText = this.rules.required[1];
                        return false;
                    }
                } else {
                    if (this.currentVal.length > 0) {
                        return true;
                    } else {
                        this.errorText = this.rules.required[1];
                        return false;
                    }
                }
            },
            sizeCheck:function(){
                var len = this.currentVal.length;
                if (len < this.rules.size[0] || len > this.rules.size[1]) {
                    this.errorText = this.rules.size[2];
                    return false;
                } else {
                    return true;
                }
            },
            equalCheck: function () {
                var value = this.rules.equal[0].val();
                if (this.currentVal === value) {
                    return true;
                } else {
                    this.errorText = this.rules.equal[1];
                    return false;
                }
            },
            emailCheck: function () {
                if (_.regexp.Email.test(this.currentVal)) {
                    return true;
                } else {
                    this.errorText = this.rules.email[1];
                    return false;
                }
            },
            phoneCheck: function () {
                if (_.regexp.Mobile.test(this.currentVal)) {
                    return true;
                } else {
                    this.errorText = this.rules.phone[1];
                    return false;
                }
            },
            regexCheck: function () {
                if (this.rules.regex[0].test(this.currentVal)) {
                    return true;
                } else {
                    this.errorText = this.rules.regex[1];
                    return false;
                }
            },
            setRemoteParams: function () {
                var that = this,
                    params = this.rules.remote[0],
                    ajaxParams = {
                        type: 'GET',
                        url: '',
                        dataType: "json",
                        success: function (result) {
                            if (result.status) {
                                that.ok();
                            } else {
                                that.errorText = that.rules.remote[1];
                                that.error();
                            }
                        }
                    };
                if (typeof params === 'object') {
                    jQuery.extend(ajaxParams, params);
                    jQuery.each(ajaxParams.data, function (key, item) {
                        if (item === '${value}') {
                            that.remoteDataKey = key;
                        }
                    });
                }
                this.remoteParams = ajaxParams;
            },
            remoteCheck: function () {
                this.delayCheck = true;
                var params = this.rules.remote[0];
                if (typeof params === 'string') {
                    this.remoteParams.url = params + this.currentVal + '?' + (new Date()).getTime();
                } else {
                    this.remoteParams.data[this.remoteDataKey] = this.currentVal;
                }
                jQuery.ajax(this.remoteParams);
                return true;
            },
            ok: function () {
                var status = this.$input.data('status');
                if (status === 'note' && this.$note) {
                    this.$note.hide();
                } else if (status === 'error') {
                    this.$input.removeClass('error');
                    this.$error && this.$error.hide();
                }
                if (status !== 'ok') {
                    this.$input.addClass('ok').data('status', 'ok');
                    this.$ok && this.$ok.show();
                }
                this.checkResult = true;
            },
            error: function () {
                var status = this.$input.data('status');
                if (status === 'note' && this.$note) {
                    this.$note.hide();
                } else if (status === 'ok') {
                    this.$input.removeClass('ok');
                    this.$ok && this.$ok.hide();
                }
                this.$error && this.$error.html(this.errorText);
                if (status !== 'error') {
                    this.$input.addClass('error').data('status', 'error');
                    this.$error && this.$error.show();
                }
                this.checkResult = false;
            },
            check: function () {
                var i, len = this.waitingChecks.length,
                    value = this.$input.val();
                this.currentVal = this.$input.attr('type') === 'password' ? value : $.trim(value);
                if (this.currentVal.length > 0 || $.inArray('requiredCheck', this.waitingChecks) > - 1) {
                    for (i = 0; i < len; i++) {
                        if (this[this.waitingChecks[i]] && !this[this.waitingChecks[i]]()) {
                            this.error();
                            return;
                        }
                    }
                    if (!this.delayCheck) {
                        this.ok();
                    }
                } else {
                    this.checkResult = true;
                }
            },
            focus: function (value) {
                this.focusValue = value;
                if (this.$input.data('status') === 'noActive') {
                    this.$input.data('status', 'note');
                    if (this.$note) {
                        this.$note.show();
                    }
                }
            },
            bind: function () {
                var that = this;
                if (this.$input.attr('type') === 'checkbox') {
                    this.$input.change(function () {
                        that.check();
                    });
                } else {
                    this.$input.bind({
                        focus: function () {
                            that.focus(this.value);
                        }, blur: function () {
                            if (that.focusValue && that.focusValue === this.value) {
                                return;
                            } else {
                                that.check();
                            }
                        }
                    });
                }
            },
            create: function () {
                this.$message = jQuery('<div class="message"></div>');
                this.$error = jQuery('<p class="error" style="display:none;"></p>').appendTo(this.$message);
                this.$input.after(this.$message).data('status', 'noActive');
            },
            config: function () {
                var key;
                for (key in this.rules) {
                    if (key !== 'ok' || key !== 'note') {
                        this.waitingChecks.push(key + 'Check');
                    }
                }
                if (this.rules.remote) {
                    this.setRemoteParams();
                }
            }
        })
    });
    $(function() { UE.rootScrollingElem = _.ua.isWebKit ? document.body : UE.rootElem });
    /**************************
    ** namespace UE.fixIE6Select
    **************************/
    _.ns('UE.fixIE6Select', {
        _ini: function() {
            if (_.ua.isIE6) {
                this.jSelect = $('select');
            }
            this._ini = $.noop;
        },
        hide: function(fn) {
            if (_.ua.isIE6) {
                this._ini();
                var jSelect = _.isFunction(fn) ? fn(this.jSelect) : this.jSelect;
                jSelect.css('visibility', 'hidden');
            }
        },
        show: function(){
            if (_.ua.isIE6) {
                this.jSelect.css('visibility', 'visible');
            }
        }
    });
    /**************************
    ** namespace UE.Iframe
    **************************/
    _.ns('UE.Iframe', {
        autoHeight:function(id){
            if(typeof id === 'string') id = document.getElementById(id);
            var that = this;
            var inited = false;
            var loadfn = function(){
                var doc = id.contentWindow.document;
                if(!inited && /undefined|loaded|complete/.test(doc.readyState)) {
                    inited = true;
                    id.style.height = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight) + 'px';
                }
            };
            loadfn();
            if(id.attachEvent) {
                id.attachEvent('onload', loadfn);
            } else {
                id.onload = loadfn;
            }
        }
    });
    /**
     * 模版编译缓存
     * @type {Object}
     */
    var templateCache = {};
    /**
     * 模版缓存
     * @type {Object}
     */
    var tmpl_cache = {};
    /**
     * namespace UE.tmpl
     */
    _.ns('UE.tmpl', {
        get: function(name) { return tmpl_cache[name] || ''; },
        extend: function() {
            var args = _.toArray(arguments);
            args.unshift(tmpl_cache);
            _.extend.apply(tmpl_cache, args);
        },
        render: function(temp, data){
            var text = String(temp);
            var tmpKey = text;
            if (text.charAt(0) === '#') {
                text = $(text).html();
            }
            if(!templateCache[tmpKey]) {
                templateCache[tmpKey] = _.template(text, null, {variable:'data'});
            }
            return templateCache[tmpKey](data);
        }
    });
    /*************************
    ** namespace UE.env
    *************************/
    var env_str = 'development';
    var env_host = _.url.host;
    if (/uemall.com/.test(env_host)) {
        env_str = 'production';
    } else if (/v2.ue.com/.test(env_host)) {
        env_str = 'testing';
    }
    var env_obj = {
        development: {
            gaAccount: 'UA-20697969-3',
            rootDomain: env_host,
            mediaSrv: env_host,
            skinSrv: env_host
        },
        testing: {
            gaAccount: 'UA-20697969-2',
            rootDomain: env_host,
            mediaSrv: env_host,
            skinSrv: env_host
        },
        production: {
            gaAccount: 'UA-20697969-1',
            rootDomain: env_host,
            mediaSrv: 'i1.uemall.com',
            skinSrv: 'skin.uemall.com'
        }
    };
    _.ns('UE.env', function(){
        _.mix(this, env_obj[env_str]);
        this['is' + _.str.capitalize(env_str)] = true;
    });
    /**************************
    ** namespace UE.msg
    **************************/
    _.ns('UE.msg', {
        extend: function() {
            var args = _.toArray(arguments);
            args.unshift(this);
            _.extend.apply(this, args);
        }
    });
    /**************************
    ** namespace UE.action
    **************************/
    _.ns('UE.action', function(){
        var _fnList = {};
        this.extend = function(){
            $.extend.apply(_fnList, arguments);
        };
		var bind = function(selector){
			$(document.body).on('click', selector, function(e){
				UE.log('[Action] link clicked.');
				var name = this.getAttribute('href');
				name = name.split('#')[1];
				if (name) {
					UE.log('[Action] action name is: ' + name);
					var callback = _fnList[name];
					if($.isFunction(callback)){
						UE.log('[Action] callback firing: ' + name);
						callback.call(this, e, name);
						UE.log('[Action] callback fired: ' + name);
					} else {
						UE.log('[Action] callback not found: ' + name);
					}
				} else {
					UE.log('[Action] link has no action.');
				}
                e.preventDefault();
                return false;
			});
		};
        this.bind = bind;
        this.trigger = function(name){
            $('a[href="#' + name + '"]').trigger('click');
        };
        $(function(){ bind('a.cmAction') });
    });
    /**
     * [getBlockById 获取cms中静态块block的内容]
     */
    _.ns('UE.cms', {
        _api:'/cms/index/ajaxBlock/',
        /**
         * 获取指定block_id的静态块内容
         * @param  {[type]}   id       [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getBlockById:function(id, callback){
            var url = this._api + '?block_id=' + id;
            $.getJSON(url, callback);
        },
        /**
         * 获取指定block组的静态块内容，根据时间有效动态显示
         * @param  {[type]}   name     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getBlockByName:function(name, callback){
            var url = this._api + '?gname=' + name;
            $.getJSON(url, callback);
        }
    });
    /**
     * 通过节点配置自动调用callback，节点的id作为路由的key
     * @return {[type]} [description]
     */
    _.ns('UE.loadom', function(){
        var _load_list = {};
        var _dom_list = {};
        this.extend = function(){
            $.extend.apply(_load_list, arguments);
            trigger();
        };
        var trigger = function(id){
            if(id){
                var callback = _load_list[id];
                if($.isFunction(callback) && !_load_list[id].status){ 
                    _load_list[id].status = 1; 
                    callback(id);
                }
            } else {
                $.each(_load_list, function(id){
                    _dom_list[id] && trigger(id);
                });
            }
        };
        var bind = function(selector){
            $(selector).each(function(){
                var id = this.id;
                if(id){ _dom_list[id]=1;trigger(id); }
            });
        };
        this.trigger = trigger;
        $(function(){ bind('.load-ajax'); });
    });
    _.ns('UE.ajax', {
        /**
         * 把商品添加至用户收藏夹
         * @param  {[type]}   id       商品id
         * @param  {[type]}   data     sku,price,qty
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        addUserFav: function(id, data, callback){
            if(UE.user.getLoginState()){
                $.post('/wishlist/index/addByAjax/product/' + id + '/', data, callback, 'json');
            } else {
                callback(false);
                UE.popup.login();
            }
        },
        /**
         * 把商品添加至购物车
         * @param  {[type]}   id       商品id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        addCart:function(id, data, callback){
            $.post('/checkout/cart/addByAjax/product/' + id + '/', data, callback, 'json');
        },
        /**
         * 返回当前所有激活的品牌数据接口
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getBrands:function(callback){
            $.getJSON('/brand/api/brands/', callback);
        },
        /**
         * UETrace 商品推荐接口
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        get_trace_topProduct:function(data, callback){
            var url = "/catalog/product_uetraceapi/topvpro/";
            $.each(data, function(k, v){
                url = url + k + '/' + v + '/';
            });
            $.getJSON(url, callback);
        }
    });
    /**
     * 用户数据处理异步队列
     * @type {[type]}
     */
    var user_live_callbacks = $.Callbacks('once memory');
    /**
     * namespace UE.user
     */
    _.ns('UE.user', {
        member: {
            userName:'',
            userId:'',
            isLoggedIn:false,
            csId:'',
            email:'',
            qq:'',
            phone:'',
            sessionId:'',
            utmSource: false
        },
        /**
         * 获取用户登陆状态
         * @return {[type]} [description]
         */
        getLoginState: function(){
            return this.member.isLoggedIn;
        },
        /**
         * 添加用户数据处理队列接口
         * @return {[type]} [description]
         */
        liveCallback: function(){
            user_live_callbacks.add.apply(user_live_callbacks, arguments);
        },
        ini: function(){
            var that = this;
            this.topView.ini();
            /**
             * 获取用户登陆信息
             */
            this.live.getRequest();
        },
        live: {
            postUrl: '/checkout/cart/liveboxv2/',
            getRequest: function(){
                var oUrlParams = _.url.parseQuery(_.url.query);
                var sReferrer = document.referrer;
                if (sReferrer && !_.str.startsWith(sReferrer, 'http://' + _.url.host)) {  //if form other site
                    $.extend(oUrlParams, {referrer: sReferrer});
                }
                $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    data: oUrlParams,
                    url: this.postUrl,
                    success: function(data){
                        if (data.status === true || data.status === 'true') {
                            var user = UE.user.member;
                            user.isLoggedIn = (data.userinfo.islogged === true || data.userinfo.islogged === 'true');
                            user.userName = data.userinfo.surname || '';
                            user.userId = data.userinfo.user_id || '';
                            user.sessionId = data.userinfo.session_id || '';
                            user.csId = data.userinfo.csid || '';
                            user.qqMember = data.userinfo.QQ_showmsg || '';
                            user.utmSource = data.userinfo.utm_source || '';
                            user.email = data.userinfo.email || '';
                            user.phone = data.userinfo.phone || '';
                            user.qqCaibei = data.userinfo.qq || '';
                            user.unitedLogin = data.userinfo.united_login;
                            user_live_callbacks.fire(data);
                        }
                    }
                });
            }
        },
        topView:{
            ini:function(){
                UE.tmpl.extend({
                    'top-login-no':[
                        '您好，欢迎来到优e网！',
                        '<a class="link-reg" href="/customer/account/create/">注册</a> | ',
                        '<a class="link-login" href="/customer/account/login/">登录</a>'
                    ].join(''),
                    'top-login':[
                        '您好，<%=data.surname%>，欢迎回到优e网！ ',
                        '<a class="link-myue" href="/customer/account/edit/">我的优e</a> | ',
                        '<a class="link-logout" href="/customer/account/logout/">退出</a>'
                    ].join('')
                });
                /**
                 * 增加页头用户信息渲染程序至处理队列
                 * @param  {[type]} d [description]
                 * @return {[type]}   [description]
                 */
                UE.user.liveCallback(function(d) {
                    var html = d.userinfo.islogged ?  UE.tmpl.render(
                        UE.tmpl.get('top-login'),
                        d.userinfo
                    ) : UE.tmpl.get('top-login-no');
                    UE.user.topView.render(html);
                });
                $('#login').on('click','a', function(){
                    if(this.className == 'link-reg'){
                        UE.popup.register();
                        return false;
                    } else if(this.className == 'link-login'){
                        UE.popup.login();
                        return false;
                    }
                });
            },
            render:function(html){
                $('#login').html(html);
            }
        }
    });
    /**
     * 初始化执行用户登录检查
     * @param  {[type]} ){ UE.user.ini(); } [description]
     * @return {[type]}     [description]
     */
    $(function(){ UE.user.ini(); });
    /**
     * popup 浮层处理队列
     * @type {[type]}
     */
    var popup_live_callback = $.Callbacks('memory');
    /**
     * login && register popup
     */
    _.ns('UE.popup', {
        login:function(){
            this._iniTemplate();
            $('#login-popup').fadeIn(function(){
                UE.mask.show();
                UE.action.trigger('popup-change-login');
            });
            this._bind();
            this.status = 'login';
            popup_live_callback.fire('login');
        },
        register:function(){
            this._iniTemplate();
            $('#login-popup').fadeIn(function(){
                UE.mask.show();
                UE.action.trigger('popup-change-register');
            });
            this._bind();
            this.status = 'register';
            popup_live_callback.fire('register');
        },
        close:function(){
            $('#login-popup').hide();
            UE.mask.hide();
            popup_live_callback.fire('close');
        },
        liveCallback:function(){
            popup_live_callback.add.apply(popup_live_callback, arguments);
        },
        _bind:_.once(function(){
            var that = this;
            var popupWrap = $('#login-popup');
            popupWrap.find('input.cmCheckbox').jqCheckbox();
            /**
             * 回车提交
             * @param  {[type]} e [description]
             * @return {[type]}   [description]
             */
            popupWrap.find('input.cmText').on('keydown', function(e){
                if(e.keyCode == 13){
                    UE.action.trigger('popup-login');
                }
            });
            UE.action.extend({
                'popup-login-close':function(){
                    UE.popup.close();
                },
                /**
                 * 切换至登录popup
                 * @return {[type]} [description]
                 */
                'popup-change-login':function(){
                    popupWrap.attr('class','user-login-popup');
                    this.status = 'login';
                },
                /**
                 * 切换至注册popup
                 * @return {[type]} [description]
                 */
                'popup-change-register':function(){
                    popupWrap.attr('class','user-register-popup');
                    this.status = 'register';
                    that.register.bindValid();
                },
                'popup-login':function(){
                    var btn = $(this);
                    if(!btn.hasClass('disabled')){
                        btn.addClass('disabled');
                        that.login.submit(function(){
                            btn.removeClass('disabled');
                        });
                    }
                },
                'popup-register':function(){
                    var btn = $(this);
                    if(!btn.hasClass('disabled')){
                        btn.addClass('disabled');
                        that.register.submit(function(){
                            btn.removeClass('disabled');
                        });
                    }
                }
            });
        }),
        _iniTemplate:_.once(function(){
            var tmpl = _.str.tmpBuffer();
            tmpl.add('<div id="login-popup" class="user-login-popup" style="display:none;">');
                tmpl.add('<div class="popup-wrapper clearfix">');
                    tmpl.add('<div class="wrap-left">');
                        tmpl.add('<div class="login-submit">');
                            tmpl.add('<div class="wrap-top">');
                                tmpl.add('<h3>LOGIN</h3>');
                                tmpl.add('<h4>用户登录</h4>');
                                tmpl.add('<form id="popup-login-form" action="/customer/account/loginPostAjax/" method="post"><table class="login-form"><tbody>');
                                    tmpl.add('<tr><th>用户名/邮箱/手机</th><td colspan="2"><input type="text" name="login[username]" id="popup-name" class="cmText" /></td></tr>');
                                    tmpl.add('<tr><th>密码</th><td colspan="2"><input type="password" name="login[password]" id="popup-pwd" class="cmText" /></td></tr>');
                                    tmpl.add('<tr><th>&nbsp;</th><td><input type="checkbox" class="cmCheckbox" name="login[rememberme]" id="popup-remember" checked="checked" value="1" /><label for="popup-remember">记住密码</label></td><td><a class="forgot-pwd" href="/customer/account/forgotpassword/">忘记密码？</a></td></tr>');
                                    tmpl.add('<tr><th>&nbsp;</th><td colspan="2"><a class="cmAction cmBtn" href="#popup-login"><span>登录</span></a></td></tr>');
                                tmpl.add('</tbody></table></form>');
                            tmpl.add('</div>');
                            tmpl.add('<div class="wrap-bottom login-sns">');
                                tmpl.add('<h5>您还可以用以下账号登录</h5>');
                                tmpl.add('<ul class="login-sns-list">');
                                    tmpl.add('<li><a class="login-sns-weibo" href="/oauth/sinaoauth/jump/"><b></b>新浪微博</a></li>');
                                    tmpl.add('<li><a class="login-sns-alipay" href="/oauth/alipayoauth/jump/"><b></b>支付宝</a></li>');
                                    tmpl.add('<li><a class="login-sns-kaixin" href="/oauth/kaixinoauth/jump/"><b></b>开心网</a></li>');
                                    tmpl.add('<li><a class="login-sns-qq" href="/oauth/qqoauth/jump/"><b></b>腾讯QQ</a></li>');
                                    tmpl.add('<li><a class="login-sns-163" href="/oauth/neteaseoauth/jump/"><b></b>网易通行证</a></li>');
                                tmpl.add('</ul>');
                            tmpl.add('</div>');
                        tmpl.add('</div>');
                        tmpl.add('<div class="login-action">');
                            tmpl.add('<div class="wrap-top">');
                                tmpl.add('<h5>我已经拥有优e网的账户</h5>');
                                tmpl.add('<h6>登录后，立刻享受会员专属特权</h6>');
                                tmpl.add('<a class="cmAction cmBtn" href="#popup-change-login"><span>立刻登录</span></a>');
                            tmpl.add('</div>');
                            tmpl.add('<div class="wrap-bottom event-join-us">');
                                tmpl.add('<img src="/skin/frontend/uemall_v3/default/images/topic/register/join-us-popup.jpg" />');
                            tmpl.add('</div>');
                        tmpl.add('</div>');
                    tmpl.add('</div>');
                    tmpl.add('<div class="wrap-right">');
                        tmpl.add('<div class="register-submit">');
                            tmpl.add('<div class="wrap-top">');
                                tmpl.add('<h3>REGISTER</h3>');
                                if(UE.user.member.utmSource == '360'){
                                    tmpl.add('<h4>欢迎您<span class="flag-360">360</span>用户</h4>');
                                } else {
                                    tmpl.add('<h4>用户注册</h4>');
                                }
                                tmpl.add('<form id="popup-register-form" action="/customer/account/createpost/" method="post"><table class="register-form"><tbody>');
                                    tmpl.add('<tr><th>邮箱</th><td><input type="text" name="email" id="popup-femail" class="cmText" /></td></tr>');
                                    tmpl.add('<tr><th>用户名</th><td><input type="text" name="fusername" id="popup-fname" class="cmText" /></td></tr>');
                                    tmpl.add('<tr><th>手机</th><td><input type="text" name="fphone" id="popup-fmobile" class="cmText" /></td></tr>');
                                    tmpl.add('<tr><th>密码</th><td><input type="password" name="password" id="popup-fpwd" class="cmText" /></td></tr>');
                                    tmpl.add('<tr><th>重复密码</th><td><input type="password" name="confirmation" id="popup-fcpwd" class="cmText" /></td></tr>');
                                    tmpl.add('<tr><th>&nbsp;</th><td><input type="checkbox" class="cmCheckbox" name="is_subscribed" id="e-periodical" checked="checked" value="1" /><label for="e-periodical">希望收到优E网的电子期刊</label></td></tr>');
                                    tmpl.add('<tr><th>&nbsp;</th><td class="popup-reg-cond"><input type="checkbox" class="cmCheckbox" name="is_condition" id="ue-provision" checked="checked" value="1" /><label for="ue-provision">已阅读并且同意</label><a class="reg-claim" target="_blank" href="/static/html/claim/claim.html">优E网使用条件</a></td></tr>');
                                    tmpl.add('<tr><th>&nbsp;</th><td><a class="cmAction cmBtn" href="#popup-register"><span>注册</span></a></td></tr>');
                                tmpl.add('</tbody></table></form>');
                            tmpl.add('</div>');
                            tmpl.add('<div class="wrap-bottom wrap-quality">');
                                tmpl.add('<ul class="wrap-quality-list clearfix">');
                                    tmpl.add('<li class="quality">正品保证</li>');
                                    tmpl.add('<li class="payment">货到付款</li>');
                                    tmpl.add('<li class="ziti">门店自提</li>');
                                    tmpl.add('<li class="returns">7天退换</li>');
                                tmpl.add('</ul>');
                            tmpl.add('</div>');
                        tmpl.add('</div>');
                        tmpl.add('<div class="register-action">');
                            tmpl.add('<div class="wrap-top">');
                                tmpl.add('<h5>我还没有注册优e网</h5>');
                                tmpl.add('<h6>注册即可享受以下<strong>会员专属</strong>权益</h6>');
                                tmpl.add('<ul class="enjoy-vip">');
                                    tmpl.add('<li><b class="r-corner"></b> 马上加入，最高可享折上9.2折优惠</li>');
                                    tmpl.add('<li><b class="r-corner"></b> 优惠活动一手信息</li>');
                                    tmpl.add('<li><b class="r-corner"></b> 您的一对一专属购物顾问</li>');
                                tmpl.add('</ul>');
                                tmpl.add('<a class="cmAction cmBtn" href="#popup-change-register"><span>马上加入</span></a>');
                            tmpl.add('</div>');
                            tmpl.add('<div class="wrap-bottom wrap-quality">');
                                tmpl.add('<ul class="wrap-quality-list clearfix">');
                                    tmpl.add('<li class="quality">正品保证</li>');
                                    tmpl.add('<li class="payment">货到付款</li>');
                                    tmpl.add('<li class="ziti">门店自提</li>');
                                    tmpl.add('<li class="returns">7天退换</li>');
                                tmpl.add('</ul>');
                            tmpl.add('</div>');
                        tmpl.add('</div>');
                    tmpl.add('</div>');
                    tmpl.add('<div></div><a class="cmAction login-popup-close" href="#popup-login-close">&#215;</a>');
                tmpl.add('</div>');
            tmpl.add('</div>');
            $('body').append(tmpl.join());
        })
    });
    /**
     * 用户登录数据处理异步队列
     * @type {[type]}
     */
    var login_live_callbacks = $.Callbacks('memory');
    _.ns('UE.popup.login', {
        liveCallback:function(){
            login_live_callbacks.add.apply(login_live_callbacks, arguments);
        },
        submit:function(fn){
            this._ini();
            this._createValid();
            if(this._valid()){
                var data = this._data_serialize();
                $.post('/customer/account/loginPostAjax/', data, function(d){
                    if(!d.status) _.fire(fn);
                    login_live_callbacks.fire(d);
                }, 'json');
            } else {
                _.fire(fn);
            }
        },
        _ini:_.once(function(){
            this.liveCallback(function(d){
                if(d.status){ location.reload(); } else {
                    /**
                     * 登陆失败，先隐藏
                     */
                    UE.popup.close();
                    /**
                     * 提示失败消息，关闭消息框，再打开登录窗口
                     */
                    UE.alert(d.msg, function(status){
                        if(!status) UE.popup.login();
                    });
                }
            });
        }),
        _data_serialize:function(){
            return $('#popup-login-form').serialize();
        },
        _createValid:_.once(function(){
            this._valid_list = {
                id: new UE.Validation('#popup-name', {required: [true, '不能为空']}),
                pass: new UE.Validation('#popup-pwd', {required: [true, '不能为空']})
            };
        }),
        _valid:function(){
            var that = this;
            var status = true;
            var firstErrorClass;
            $.each(this._valid_list, function(n, v){
                v.check();
                if(!v.checkResult && status){
                    status = false;
                    if(!firstErrorClass){
                        v.$input.focus();
                        firstErrorClass = v;
                    }
                }
            });
            return status;
        }
    });
    _.ns('UE.popup.register', {
        submit:function(fn){
            if(this._valid()){
                $('#popup-register-form').submit();
            } else {
                _.fire(fn);
            }
        },
        bindValid:_.once(function(){
            this._valid_list = {
                email: new UE.Validation('#popup-femail', {
                    required: [true, '邮箱不能为空'], 
                    email: [true, '邮箱地址有误'], 
                    remote: [{
                        url: '/customer/account/validateemail/', 
                        type: 'post', 
                        data: { email: '${value}' }
                    }, '该邮箱已注册，已注册用户请<a href="#popup-change-login" class="cmAction">直接登录<\/a>']
                }),
                name: new UE.Validation('#popup-fname', {
                    required: [true, '用户名不能为空'],
                    regex: [/[a-z]+/, '用户名只要包含一个字母'],
                    remote: [{
                        url: '/customer/account/validatefusername/',
                        type: 'post',
                        data: {fusername: '${value}'}
                    }, '该用户名已注册，已注册用户请<a href="#popup-change-login" class="cmAction">直接登录<\/a>']
                }),
                phone: new UE.Validation('#popup-fmobile', {
                    required: [true, '手机号码不能为空'],
                    phone: [true, '手机号码有误'],
                    remote: [{
                        url: '/customer/account/validatefphone/',
                        type: 'post',
                        data: {fphone: '${value}'}
                    }, '该手机已注册，已注册用户请<a href="#popup-change-login" class="cmAction">直接登录<\/a>']
                }),
                pass: new UE.Validation('#popup-fpwd', {
                    required: [true, '密码不能为空'],
                    size: [6, 16, '应为6-16个字符']
                }),
                pass2: new UE.Validation('#popup-fcpwd', {
                    required: [true, '请再次输入密码'],
                    equal: [$('#popup-fpwd'), '两次输入不一致']
                }),
                agree: new UE.Validation('#ue-provision', {required: [true, '请阅读并同意使用条件']})
            };
        }),
        _valid:function(){
            var that = this;
            var status = true;
            var firstErrorClass;
            $.each(this._valid_list, function(n, v){
                v.check();
                if(!v.checkResult && status){
                    status = false;
                    if(!firstErrorClass){
                        v.$input.focus();
                        firstErrorClass = v;
                    }
                }
            });
            return status;
        }
    });
    /**************************
    ** namespace UE.sns
    **************************/
    _.ns('UE.sns', {
        link: {
            weibo: "http://v.t.sina.com.cn/share/share.php?url=[[[url]]]&title=[[[text]]]&appkey=2264487147",
            kaixin: "http://www.kaixin001.com/~repaste/repaste.php?rurl=[[[url]]]&rtitle=[[[text]]]",
            renren: "http://share.renren.com/share/buttonshare.do?link=[[[url]]]&title=[[[text]]]",
            end: null
        },
        getShareLink: function(site, url, text) {
            var link = '';
            if (site && url && text) {
                var temp = this.link[site];
                if (temp) {
                    link = _.str.replaceVar(temp, '[[[url]]]', encodeURIComponent(url));
                    link = _.str.replaceVar(link, '[[[text]]]', encodeURIComponent(text));
                }
            }
            return link || false;
        },
        action:{
            weibo:{
                link:'http://service.weibo.com/share/share.php',
                data:{url:'url',title:'title',pic:'pic',appkey:'2264487147',ralateUid:'',language:'zh_cn'}
            },
            kaixin:{
                link:'http://www.kaixin001.com/rest/records.php',
                data:{url:'url',content:'title',pic:'pic',starid:'0',aid:'0',style:'11',stime:'',sig:''}
            },
            renren:{
                link:'http://widget.renren.com/dialog/share',
                data:{resourceUrl:'url',title:'title',images:'pic',charset:'UTF-8'}
            }
        },
        options:{url:location.href, title:document.title, pic:''},
        share:function(type, data){
            if(type && this.action[type]){
                var f = this.action[type];
                var params = [];
                data = data ? $.extend({}, this.options, data) : this.options;
                $.each(f.data, function(k, v){
                    var val = typeof data[v] == 'undefined' ? v : data[v];
                    params.push(k+'='+encodeURIComponent(val));
                });
                window.open(f.link + '?' + params.join('&'), '_blank');
            }
        }
    });
    /**************************
    ** namespace UE.mask
    **************************/
    _.ns('UE.mask', {
        _ini:_.once(function(){
            var that = this;
            this.jMask = $('<div class="cmMask"></div>').appendTo('body');
            /**
             * hack ie6 for select bug
             */
            this.jMask.bgIframe();
            $(window).resize(function () {
                that._pos();
            });
            this.isReady = true;
        }),
        _pos: function () {
            if (this.isVisible) {
                this.jMask.css({
                    width: UE.rootElem.scrollWidth + 'px',
                    height: UE.rootElem.scrollHeight + 'px'
                });
            }
        },
        show:function(callback){
            if (this.isVisible) { return false; }
            this._ini();
            this.jMask.css('visibility', 'visible');
            this.isVisible = true;
            this._pos();
            _.fire.apply(_, arguments);
        },
        hide:function(callback){
            if (!this.isVisible) { return false; }
            this.jMask.css({
                visibility: 'hidden',
                width: '0',
                height: '0'
            });
            this.isVisible = false;
            _.fire.apply(_, arguments);
        }
    });
    /**
     * UE.dialog
     * @return {[type]} [description]
     */
    _.ns('UE.dialog', function(){
        var root = this;
        var _queue_hash = {};
        var _queue_show = [];
        /**
         * 新增wrap方法，用于显示页面中已存在的节点内容
         * @param  {[type]}   selector [description]
         * @param  {Function} callback [description]
         * @param {undefined} id        无意义，仅作变量使用
         * @return {[type]}            [description]
         */
        this.wrap = function(selector, callback, id){
            if(typeof selector == 'string') selector = $(selector);
            if(id = selector.attr('dialog_id')){
                this.show({id:id, html:'', callback: callback});
            } else {
                var width = selector.width() + 
                    (parseFloat(selector.css('padding-left'))||0) + 
                    (parseFloat(selector.css('padding-right'))||0) + 
                    (parseFloat(selector.css('margin-left'))||0) +
                    (parseFloat(selector.css('margin-right'))||0);
                var height = selector.height() + 
                    (parseFloat(selector.css('padding-top'))||0) + 
                    (parseFloat(selector.css('padding-bottom'))||0) + 
                    (parseFloat(selector.css('margin-top'))||0) +
                    (parseFloat(selector.css('margin-bottom'))||0);
                id = this.show({
                    width: width,
                    height: height,
                    html: '<div class="temp_dialog_wrap"></div>',
                    callback: callback
                });
                selector.attr('dialog_id', id).show().appendTo('#'+id+' div.temp_dialog_wrap');
            }
            return id;
        };
        this.show = function(opts){
            _bindClose();
            if(!opts.id){ opts.id = _newGuid(); }
            var dialog = _queue_hash[opts.id];
            if(!dialog) _queue_hash[opts.id] = dialog = new Dialog(opts);
            dialog.show(opts);
            _pushShowStatus(opts.id);
            return opts.id;
        };
        this.hide = function(id, isMask){
            if(id && _queue_hash[id]){
                _queue_hash[id].hide(isMask);
                this._deleteDialogID(id);
            } else {
                return _popHideStatus();
            }
        };
        /**
         * 从显示队列中删除指定id的dialog
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        this._deleteDialogID = function(id){
            $.each(_queue_show, function(i, v){
                if(v === id){
                    _queue_show.splice(i, 1);
                    return false;
                }
            });
        };
        /**
         * 添加到dialog显示队列中，并且隐藏前一个显示的dialog，但不触发前一个dialog的callback
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        var _pushShowStatus = function(id){
            var prev_id = _queue_show[_queue_show.length - 1];
            if(id == prev_id) return false;
            if(_queue_hash[prev_id]){ 
                _queue_hash[prev_id]._hide();
            }
            _queue_show.push(id);
        };
        /**
         * 从dialog显示队列中移除当前显示的dialog（即关闭当前dialog），并且显示前一个dialog，但不触发callback
         * @return {[type]} [description]
         */
        var _popHideStatus = function(){
            var hide_id = _queue_show.pop();
            var dialog = _queue_hash[hide_id];
            if(dialog){ dialog.hide(); }
            var next_id = _queue_show[_queue_show.length - 1];
            dialog = _queue_hash[next_id];
            if(dialog){ dialog._show(); }
            return hide_id;
        };
        /**
         * 创建一个新的dialog_id，并且保证不重复
         * @return {[type]} [description]
         */
        var _newGuid = function(){
            var id = _.getRandGuid();
            if(_queue_hash[id]) return _newGuid();
            return id;
        };
        var _bindClose = _.once(function(){
            UE.action.extend({
                'dialog-close':function(){
                    root.hide();
                }
            });
        });
    });
    var dialog_defaults = {
        mask:true,
        width:450,
        height:170,
        html:''
    };
    var Dialog = _.newClass({
        initialize: function(opts){
            this.options = $.extend({}, dialog_defaults, opts);
            this.id = '#' + this.options.id;
            this.isCreateWrap = false;
        },
        createWrap:function(){
            if(this.isCreateWrap) return false;
            this.isCreateWrap = true;
            var html = '<div class="cmDialog" id="' + this.options.id + '" style="display:none;">';
            html += '<div class="cmDialogWrap">';
            html += '<div class="cmDialogContent">' + this.options.html + '</div>'
            html += '<a class="cmAction cmDialogClose" href="#dialog-close"></a>';
            html += '</div></div>';
            $('body').append(html);
        },
        show:function(opts){
            if(!this.status){
                $.extend(this.options, opts);
                if(this.options.html){
                    $(this.id).find('div.cmDialogContent').html(this.options.html);
                }
                this._show();
                this.bindDelay();
                _.fire(this.options.callback, this.status);
            }
        },
        _show:function(){
            this.status = 1;
            this.createWrap();
            this.clearDelay();
            $(this.id).show();
            this.resize();
            if(this.options.mask) UE.mask.show();
        },
        hide:function(isMask){
            if(this.status){
                this._hide();
                if(isMask==undefined?this.options.mask:isMask) UE.mask.hide();
                _.fire(this.options.callback, this.status);
            }
        },
        _hide:function(){
            this.status = 0;
            this.clearDelay();
            $(this.id).hide();
        },
        resize:function(){
            var dialog = $(this.id);
            var wrap = dialog.find('div.cmDialogWrap');
            var wrap_content = wrap.find('div.cmDialogContent');
            var _height = wrap_content.css('height','auto').height();
            if(_height > this.options.height){
                this.options.height = _height;
            }
            var wrap_width = this.options.width + 10;
            var wrap_height = this.options.height + 10;
            wrap_content.css({
                'width': this.options.width,
                'height': this.options.height
            });
            wrap.css({
                'width': this.options.width,
                'height': this.options.height
            });
            dialog.css({
                'width': wrap_width,
                'height': wrap_height,
                'margin-left': - wrap_width / 2,
                'margin-top': - wrap_height / 2
            });
        },
        bindDelay:function(){
            if(this.options.delay){
                var that = this;
                this.delayTimeID = setTimeout(function(){
                    that.options.delay = null;
                    that.hide(); 
                    UE.dialog._deleteDialogID(that.options.id); 
                }, this.options.delay)
            }
        },
        clearDelay:function(){
            if(this.delayTimeID) {
                clearTimeout(this.delayTimeID);
                this.delayTimeID = null;
                this.options.delay = null;
            }
        }
    });
    /**************************
    ** namespace UE.loading
    **************************/
    _.ns('UE.loading', {
        isReady: false,
        isVisible: false,
        _ini: function () {
            if (!this.isReady) {
                this.jLoading = $('<div class="cmLoading"></div>').appendTo('body');
                this.jLoading.bgIframe();
                this.isReady = true;
                this._ini = $.noop;
            }
        },
        show: function () {
            if (this.isVisible) {return false; }
            this._ini();
            this.jLoading.show();
            UE.mask.show();
            this.isVisible = true;
        },
        hide: function () {
            if (!this.isVisible) {return false; }
            this.jLoading.hide();
            UE.mask.hide();
            this.isVisible = false;
        }
    });
    /**************************
    ** namespace UE.tab
    **************************/
    _.ns('UE.tab', {
        ini: function(tabs, contents, opts) {
            return new Tab(tabs, contents, opts);
        }
    });
    var Tab_options = {
        type: 'hover',
        tabClass: 'active',
        contentClass: ''
    };
    var Tab = _.newClass({
        initialize:function(tabs, contents, opts){
            if (tabs && _.isString(tabs)) tabs = $(tabs);
            if (contents && _.isString(contents)) contents = $(contents);
            this._jTabs = tabs;
            this._jContents = contents;
            opts = this.options = $.extend({}, Tab_options, opts);
            if ($.isFunction(opts.changeBefore)) this.changeBefore(opts.changeBefore);
            if ($.isFunction(opts.changeAfter)) this.changeAfter(opts.changeAfter);
            this._bind();
        },
        changeBefore: function(fn) {
            if (_.isFunction(fn)) {
                if (!this._event_before) this._event_before = [];
                this._event_before.push(fn);
            }
            return this;
        },
        changeAfter: function(fn) {
            if (_.isFunction(fn)) {
                if (!this._event_after) this._event_after = [];
                this._event_after.push(fn);
            }
            return this;
        },
        _bind: function() {
            var opt = this.options;
            var that = this;
            if (opt.type === 'hover') {
                this._jTabs.hover(function() {
                    that._active_before(this);
                }, function() {
                    that._active_after(this);
                });
            } else {
                this._active_before_tab = this._jTabs.bind(opt.type, function() {
                    if (that._active_before_tab) {
                        that._active_after(that._active_before_tab);
                    }
                    that._active_before_tab = this;
                    that._active_before(this);
                }).filter('.'+opt.tabClass).get(0);
            }
        },
        _active_before: function(el) {
            var fn = this._event_before;
            var isTriggerDefault = true;
            var i = this._jTabs.index(el);
            var jCon = this._jContents.eq(i);
            var opt = this.options;
            if (opt.tabClass) {
                this._jTabs.removeClass(opt.tabClass);
                $(el).addClass(opt.tabClass);
            }
            if (fn) {
                _.each(fn, function(f) {
                    if (f.call(el, jCon) === false) isTriggerDefault = false;
                });
            }
            if (isTriggerDefault) {
                if (opt.contentClass) {
                    this._jContents.removeClass(opt.contentClass);
                    jCon.addClass(opt.contentClass);
                } else {
                    this._jContents.hide();
                    jCon.show();
                }
            }
        },
        _active_after: function(el) {
            var fn = this._event_after;
            if (fn) {
                var i = this._jTabs.index(el);
                var jCon = this._jContents.eq(i);
                _.each(fn, function(f) {
                    f.call(el, jCon)
                });
            }
        }
    });
    /**************************
    ** namespace placeholder
    **************************/
    _.ns('UE.placeholder', {
        ini: function(obj) {
            if (_.isString(obj)) { obj = $(obj); }
            var isSupportPlaceholder = _.support.input.placeholder;
            obj.each(function(){
                var input = this;
                var obj_id = this.id;
                var obj = $(this);
                if(!isSupportPlaceholder){
                    var placeholder_text = obj.attr('placeholder');
                    var val = $.trim(input.value);
                    if(val == ''){
                        obj.val(placeholder_text).attr('style','color:#52504A;');
                    }
                    obj.focus(function(){
                        if(this.value == placeholder_text){
                            this.value = "";
                            obj.removeAttr('style');
                        }
                    }).blur(function(){
                        if(this.value == ""){
                            this.value = placeholder_text;
                            obj.attr('style','color:#52504A;');
                        }
                    });
                }
            });
        }
    });
    /**************************
    ** namespace delayTimeout
    **************************/
    var options_delayTimeout = {
        childSelector:':first',
        delay: 5000,
        speed: 500,
        fx: {},
        ini: $.noop,
        callback: $.noop
    };
    _.ns('UE.delayTimeout', {
        ini: function(obj, opts) {
            if (_.isString(obj)) { obj = $(obj); }
            var opt = $.extend({}, options_delayTimeout, opts);
            var params = $.extend({}, opt.fx);
            obj.each(function(){
                var that = this;
                if(false !== opt.ini.call(that, obj)){
                    var isFn_childSelector = typeof opt.childSelector === 'function';
                    var $that = $(that);
                    var tDelayTimeout = function(){
                        setTimeout(function(){
                            var childs = isFn_childSelector ? opt.childSelector.call(that, $that) : $that.children(opt.childSelector);
                            childs.animate(params, opt.speed, function(){
                                if(false !== opt.callback.call(this, that, obj)){
                                    tDelayTimeout();
                                }
                            });
                        }, opt.delay);
                    };
                    tDelayTimeout();
                }
            });
        }
    });
}(jQuery));