/*
 * @Author: tackchen
 * @Date: 2022-09-18 09:55:36
 * @Description: Coding something
 */

import Salary from '../calculator';
import {toast} from './toast';
import {IMapInfo, TEXT_MAP, RESULT_TEXT_MAP} from './map';

export class UI {
    inputArea: HTMLDivElement;
    resultArea: HTMLDivElement;

    salary: Salary;

    emitResultList: Function[] = [];
    necEls: HTMLElement[] = [];

    constructor () {
        this.salary = new Salary();
        this.inputArea = window.document.querySelector('.input-area') as HTMLDivElement;
        this.resultArea = window.document.querySelector('.result-area') as HTMLDivElement;
        this._initInputUI();
        this._initResultUI();
        this._calculate();
    }

    private _calculate () {
        this.salary.calculate();
        this.emitResultList.forEach(fn => fn());
    }

    private _initInputUI () {

        const more = this._ce('div', 'input-more');
        const span = this._ce('span', '');
        const i = this._ce('i', 'ei-tasks');
        more.appendChild(i);
        more.appendChild(span);
        span.innerText = '展开更多信息';

        more.onclick = () => {
            if (span.innerText.includes('展开')) {
                span.innerText = '收起更多信息';
                this.necEls.forEach(el => el.classList.add('show'));
            } else {
                span.innerText = '展开更多信息';
                this.necEls.forEach(el => el.classList.remove('show'));
            }
        };
        this.inputArea.appendChild(more);

        const fragment = this._createFragmentCommon({
            map: TEXT_MAP,
            isInput: true,
        });
        this.inputArea.appendChild(fragment);
    }

    private _initResultUI () {
        const fragment = this._createFragmentCommon({
            map: RESULT_TEXT_MAP,
            isInput: false,
        });
        this.resultArea.appendChild(fragment);
    }

    private _createWrapper (map: IMapInfo, isInput: boolean) {
        const div = this._ce('div', 'salary-wrapper');
        const title = this._ce('div', 'salary-wrapper-title');
        this._checkNec(div, isInput, map.nec);
        title.innerText = map.text;
        div.appendChild(title);
        return div;
    }

    private _checkNec (el: HTMLElement, isInput: boolean, nec = false) {
        if (isInput && !nec) {
            el.classList.add('salary-not-nec');
            this.necEls.push(el);
        }
    }

    private _createSingleItem ({
        key,
        item,
        subKey,
        isInput = true
    }: {
        key: string,
        item: IMapInfo,
        subKey?: string,
        isInput?: boolean
    }) {
        const div = this._ce('div', 'salary-item');
        const title = this._ce('span', 'salary-title');
        title.innerText = item.text;
        div.appendChild(title);

        const salary = this.salary as any;

        if (isInput) {
            // Always make housingFundRange inputs visible by setting nec to true
            const isHousingFundRange = (key === 'housingFundRange' || (key === 'housingFundRange' && (subKey === 'min' || subKey === 'max')));
            this._checkNec(div, isInput, item.nec || isHousingFundRange);
            
            const input = this._ce('input', 'salary-input') as HTMLInputElement;
    
            const value = salary[key];
            input.value = subKey ? (typeof value === 'object' ? value[subKey] : value) : value;
            if (key !== 'extraBonus')
                input.type = 'number';
    
            input.onchange = () => {
                const value = input.value;

                let inputValue: number | number[];
                if (key !== 'extraBonus') {
                    inputValue = parseFloat(value);
                } else {
                    if (value.indexOf(' ') !== -1) {
                        inputValue = value.split(' ').map(i => parseFloat(i));
                    } else {
                        inputValue = parseFloat(value);
                    }
                }
                if (subKey) {
                    if (!salary[key] || typeof salary[key] !== 'object') {
                        salary[key] = {};
                    }
                    salary[key][subKey] = inputValue;
                } else {
                    salary[key] = inputValue;
                }
                this._calculate();
                toast('计算结果已更新');
            };
            div.appendChild(input);
            if (item.unit) {
                const span = this._ce('span', 'salary-unit');
                span.innerText = item.unit;
                div.appendChild(span);
            }
        } else {
            const result = this._ce('span', 'salary-result') as HTMLInputElement;

            this.emitResultList.push(() => {
                const salaryResult = salary.salaryResult;
                let value = subKey ? salaryResult[key][subKey] : salaryResult[key];

                if (typeof value === 'number') {
                    value = value.toFixed(2) + '元';
                } else if (value instanceof Array) {
                    // Improve array value display formatting
                    if (key === 'salaryAfterTax' || key === 'salaryTax' || key === 'salaryPreTax') {
                        // Create a table-like format for monthly data
                        const rows = [];
                        for (let i = 0; i < value.length; i += 3) {
                            const rowItems = [];
                            for (let j = 0; j < 3 && i + j < value.length; j++) {
                                const idx = i + j;
                                rowItems.push(`${idx + 1}月: ${value[idx].toFixed(2)}元`);
                            }
                            rows.push(rowItems.join('  '));
                        }
                        value = rows.join('\n');
                    } else {
                        value = value.map((v, i) => {
                            return `[${i + 1}月:${v.toFixed(2)}元]`;
                        }).join(' ');
                    }
                }

                result.innerText = value;

                // Add CSS class for formatting
                if (value instanceof Array || (typeof value === 'string' && value.includes('\n'))) {
                    result.classList.add('multi-line-result');
                }
            });
            div.appendChild(result);
        }

        if (item.info || item.url) {
            const info = this._ce('i', 'ei-info-sign');
            const infoStr = item.info || '查看详情';
            info.title = infoStr;
            info.onclick = () => {
                if (item.url) {
                    window.open(item.url);
                } else {
                    toast(infoStr);
                }
            };
            div.appendChild(info);
        }
        return div;
    }

    private _createFragmentCommon ({
        map,
        isInput = true,
    }: {
        map: {[prod in string]: any},
        isInput?: boolean
    }) {
        const fragment = window.document.createDocumentFragment();
        for (const k in map) {
            const key = k as keyof typeof map;
            const value = map[key];
            if (value.base) {
                fragment.appendChild(
                    this._createSingleItem({
                        key: key as string,
                        item: value,
                        isInput
                    })
                );
            } else {
                const div = this._createWrapper(value, isInput);
                for (const kk in value) {
                    const subKey = kk as keyof typeof value;

                    if (subKey === 'text' || subKey === 'nec') continue;
                    
                    const subValue = value[subKey];
                    if (subValue.base) {
                        div.appendChild(
                            this._createSingleItem({
                                key: key as string,
                                subKey: subKey as string,
                                item: subValue,
                                isInput
                            })
                        );
                    }
                }
                fragment.appendChild(div);
            }
        }
        return fragment;
    }

    private _ce (tag: string, classOrText: string) {
        const el = window.document.createElement(tag);
        if (classOrText) {
            if (tag === 'i') {
                el.className = classOrText;
            } else if (classOrText.indexOf('salary-') === 0 || classOrText.indexOf('input-') === 0) {
                // Apply as CSS class if it's a salary- or input- prefixed class name
                el.className = classOrText;
            } else if (classOrText.substring(0, 1) === '.') {
                el.className = classOrText.substring(1);
            } else {
                el.innerText = classOrText;
            }
        }
        return el;
    }
}