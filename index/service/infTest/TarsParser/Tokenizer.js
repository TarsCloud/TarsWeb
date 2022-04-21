
/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except 
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed 
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the 
 * specific language governing permissions and limitations under the License.
 */

const STRING = /(?:"([^"\\]*(?:\\.[^"\\]*)*)")|(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g;
const DELIM = /[\s\{\}=;\[\],\(\)<>]/g;


class Tokenizer  {
    constructor(content, length, index) {
        // 去掉单行和多行注释
        this.content = content.replace(/\/\/.+/g,'').replace(/\n/g,' ').replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,'');
        this.length = length || content.length;
        this.index = index || 0;
        this.stack = [];
        this.readingString = false;
        this.stringEndsWith = '"';
    }

    readString() {
        STRING.lastIndex = this.index - 1;
        let match;
        if ((match = STRING.exec(this.content)) !== null) {
            const s = typeof match[1] !== 'undefined' ? match[1] : match[2];
            this.index = STRING.lastIndex;
            //this.stack.push(this.stringEndsWith);
            return s;
        }
    }

    next() {
        if (this.stack.length > 0) {
            return this.stack.shift();
        }
        if(this.readingString) {
            this.readingString = false;
            return this.readString();
        }
        while (/\s/.test(this.content.charAt(this.index))) {
            this.index ++;
            if(this.index == this.length) return;
        }
        if (this.index === this.length) return;
        let end = this.index;
        DELIM.lastIndex = 0;
        let delim = DELIM.test(this.content.charAt(end));
        if(!delim) {
            while(end < this.length && !DELIM.test(this.content.charAt(end)) && this.content.charAt(end) != '/') {
                end ++;
            }
        }else {
            end ++;
        }
        let token = this.content.substring(this.index, this.index = end);
        // if(token == this.stringEndsWith) {
        //     this.readingString = true;
        // }
        return token;
    }

    peek() {
        if (this.stack.length == 0) {
            let token = this.next();
            if(token === null) return;
            this.stack.push(token);
        }
        return this.stack[0];
    }
}

module.exports = Tokenizer;