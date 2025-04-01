/*
 * @Author: tackchen
 * @Date: 2022-09-18 22:43:32
 * @Description: Coding something
 */

import {ICalculateData, ICalculateResult} from '../calculator/type';

export interface IMapInfo {
    text: string;
    unit?: string;
    info?: string;
    nec?: boolean; // 是否必须
    base?: boolean;
    url?: string
}

type TTransformMap<T> = {
    [key in keyof T]:
        T[key] extends Array<any> ? IMapInfo : (
            T[key] extends object ?
                {[key2 in keyof T[key]]: IMapInfo;} & {text: string; nec?: boolean} :
                IMapInfo
        )
}

export const TEXT_MAP: TTransformMap<ICalculateData> = {
    salary: {nec: true, base: true, text: '月基础工资', unit: '元', info: '每月税前月薪金额'},
    yearEndAwards: {nec: true, base: true, text: '年终奖总额', unit: '元', info: '年终奖总金额，如果填写该项，计算优先级会高于年终奖月数，当为0时则使用年终奖月数计算'},
    yearEndAwardsNumber: {nec: true, base: true, text: '（或）年终奖月数', unit: '个月', info: '年终奖发几个月的基本工资'},
    specialAdditionalDeduction: {nec: true, base: true, text: '每月专项附加扣除', unit: '元', info: '包括赡养老人、住房贷款利息、住房租金、子女教育等专项附加扣除项目'},
    insuranceAndFundRate: {
        text: '五险一金个人缴纳部分',
        nec: true,
        pension: {base: true, text: '养老保险个人缴纳百分比', info: ''},
        medicalInsurance: {base: true, text: '医疗保险个人缴纳百分比', info: ''},
        unemploymentInsurance: {base: true, text: '失业保险个人缴纳百分比', info: '个人一般无需缴纳'},
        injuryInsurance: {base: true, text: '工伤保险个人缴纳百分比', info: '个人一般无需缴纳'},
        maternityInsurance: {base: true, text: '生育保险个人缴纳百分比', info: '个人一般无需缴纳'},
        housingFund: {nec: true, base: true, text: '住房公积金个人缴纳百分比', info: ''},
        supplementaryFund: {nec: true, base: true, text: '补充住房公积金个人缴纳百分比', info: ''},
    },
    insuranceAndFundBase: {base: true, text: '五险一金计算基数', unit: '元', info: '五险一金的缴费基数以员工上年度平均工资', url: 'https://zhidao.baidu.com/question/464011354624682485.html'},
    startingSalary: {base: true, text: '个人所得税起征点', unit: '元', info: ''},
    insuranceAndFundRateOfCompany: {
        text: '五险一金公司缴纳部分',
        pension: {base: true, text: '养老保险公司缴纳百分比', info: ''},
        medicalInsurance: {base: true, text: '医疗保险公司缴纳百分比', info: ''},
        unemploymentInsurance: {base: true, text: '失业保险公司缴纳百分比', info: ''},
        injuryInsurance: {base: true, text: '工伤保险公司缴纳百分比', info: ''},
        maternityInsurance: {base: true, text: '生育保险公司缴纳百分比', info: ''},
        housingFund: {base: true, text: '住房公积金公司缴纳百分比', info: '当填-1时表示与个人缴纳部分一致'},
        supplementaryFund: {base: true, text: '补充住房公积金公司缴纳百分比', info: '当填-1时表示与个人缴纳部分一致'},
    },
    extraBonus: {base: true, text: '每月额外津贴奖金', unit: '元', info: '每个月额外奖金，如果需要分12个月单独填写，请使用空格分开'},
    housingFundRange: {
        text: '公积金上下限',
        nec: true,
        min: {base: true, text: '下限', unit: '元', info: '公积金计算的月薪下限', url: 'http://news.sohu.com/a/564484736_121117448'},
        max: {base: true, text: '上限', unit: '元', info: '公积金计算的月薪上限', url: 'http://news.sohu.com/a/564484736_121117448'},
    }
};

export const RESULT_TEXT_MAP: TTransformMap<ICalculateResult> = {
    totalSalaryPreTax: {base: true, text: '年总税前收入', info: '一年总税前收入'},
    totalSalaryAfterTax: {base: true, text: '年税后现金收入', info: '一年税后现金收入'},
    totalHousingFundPerYear: {base: true, text: '年公积金收入', info: '全年公积金收入(个人缴纳+公司缴纳)*12个月'},
    totalSalaryAfterTaxIncludeHouseFund: {base: true, text: '年税后总包(含公积金，对标体制内）', info: '年税后总包(含公积金，对标体制内)'},
    salaryBase: {base: true, text: '月基础工资', info: '月基础工资'},
    salaryPreTax: {base: true, text: '每月税前收入', info: '12个月份税前月收入(含奖金津贴)'},
    salaryAfterTax: {base: true, text: '每月税后收入', info: '12个月份税后收入'},
    salaryAfterTaxAvg: {base: true, text: '每月平均税后输入', info: '12个月份平均税后收入'},
    salaryTax: {base: true, text: '每月个人所得税', info: '12个月份个人所得税'},
    salaryTotalTax: {base: true, text: '年总个人所得税', info: '一年个人所得税总额'},
    awardsPreTax: {base: true, text: '年终奖税前金额', info: ''},
    awardsTax: {base: true, text: '年终奖个人所得税金额', info: ''},
    awardsAfterTax: {base: true, text: '年终奖税后金额', info: ''},
    insuranceAndFund: {
        text: '五险一金个人缴纳部分',
        pension: {base: true, text: '养老保险个人缴纳金额', info: ''},
        medicalInsurance: {base: true, text: '医疗保险个人缴纳金额', info: ''},
        unemploymentInsurance: {base: true, text: '失业保险个人缴纳金额', info: ''},
        injuryInsurance: {base: true, text: '工伤保险个人缴纳金额', info: ''},
        maternityInsurance: {base: true, text: '生育保险个人缴纳金额', info: ''},
        housingFund: {base: true, text: '住房公积金个人缴纳金额', info: ''},
        supplementaryFund: {base: true, text: '补充住房公积金个人缴纳金额', info: ''},
        totalFund: {base: true, text: '五险一金个人缴纳总金额', info: ''}, // 总五险一金
        totalHousingFund: {base: true, text: '住房公积金个人缴纳总金额', info: ''}, // 总住房公积金
    },
    insuranceAndFundOfCompany: {
        text: '五险一金公司缴纳部分',
        pension: {base: true, text: '养老保险公司缴纳金额', info: ''},
        medicalInsurance: {base: true, text: '医疗保险公司缴纳金额', info: ''},
        unemploymentInsurance: {base: true, text: '失业保险公司缴纳金额', info: ''},
        injuryInsurance: {base: true, text: '工伤保险公司缴纳金额', info: ''},
        maternityInsurance: {base: true, text: '生育保险公司缴纳金额', info: ''},
        housingFund: {base: true, text: '住房公积金公司缴纳金额', info: ''},
        supplementaryFund: {base: true, text: '补充住房公积金公司缴纳金额', info: ''},
        totalFund: {base: true, text: '五险一金公司缴纳总金额', info: ''}, // 总五险一金
        totalHousingFund: {base: true, text: '住房公积金公司缴纳总金额', info: ''}, // 总住房公积金
    },
};
