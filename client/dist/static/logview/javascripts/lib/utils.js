;(
    function() {
        var Utils = {};
        window.Utils = Utils;

        Utils.locationParse =  function(str, tag){
            var searchString = str || location.search;
            tag = tag || '?';
            var searchObj = {};
            if(!searchString)
                return searchObj;
            try{
                searchObj = JSON.parse(searchString.replace(tag, '{"').replace(/&/ig, '","').replace(/\=/ig, '":"') + '"}');
            }
            catch (e){}
            return searchObj;
        };

        Utils.locationAssemble =  function(obj){
            var str = '', arr = [];
            if(obj)
            {
                var keys = Object.keys(obj);
                for(var i = 0; i < keys.length; i++)
                {
                    var key = keys[i];
                    arr.push(key + "=" + obj[key]);
                }

                str = arr.join('&');
            }
            return str;
        };

        function template(str, data) {
            if (!template.cache) {
                template.cache = {};
            }
            var cache = template.cache;
            var fn = !/\W/.test(str) ?
                cache[str] = cache[str] ||
                    template(str) :
                new Function("obj",
                    "var p=[];" +
                    "with(obj){p.push('" +
                    str.replace(/[\r\t\n]/g, " ")
                        .replace(/'(?=[^%]*%>)/g, "\t")
                        .split("'").join("\\'")
                        .split("\t").join("'")
                        .replace(/\[%=(.+?)%\]/g, "',$1,'")
                        .split("[%").join("');")
                        .split("%]").join("p.push('") + "');}return p.join('');");
            return data ? fn(data) : fn;
        }

        Utils.genHtmlFromTemplate = function (str, data, isList) {
            var obj = template(str);
            var html = "";
            if (isList) {
                for (var i = 0; i < data.length; i++) {
                    html += obj(data[i]);
                }
            } else {
                html = obj(data);
            }
            return html;
        };
    }
)();