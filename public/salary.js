/*
 * @Author: tackchen
 * @Date: 2022-09-14 22:44:18
 * @Description: Coding something
 */


/*
累计应纳税所得额 = 累计应税收入 - 累计免税收入 - 累计减除费用 - 累计专项扣除 - 累计专项附加扣除 - 累计依法确定的其他扣除

累计应税收入 : 月薪 * 月数
累计免税收入 :0
累计减除费用 = 起征点 5000 * 月数
累计专项扣除 = 五险一金 * 月数 = 月薪 * 0.225 * 月数
累计专项附加扣除 = 1500 * 月数

累计依法确定的其他扣除 = 0
累计应纳税所得额 = (月薪 - 0 - 5000 - 月薪 * 0.225 - 1500 - 0) * 月数

当月个税 = （累计应纳税所得额 * 预扣率 - 速算扣除数）- 累计减免税额【0】 - 累计已缴税额
 */

function countSalary ({
    salary = 32880, //
    specialAdditionalDeduction = 1500, // 每月专项附加扣除 租房扣除
    yearEndAwardsNumber = 5, // 年终奖月数
    insuranceAndFundBase, // 五险一金计算基础，为上一年度平均薪资，默认为salary
    startingSalary = 5000, // 个税起征点
    insuranceAndFundRate = {
        pension: 0.08, // 养老保险 个人缴费费率为8%;
        medicalInsurance: 0.02, // 医疗保险 个人缴费比例为2%;
        unemploymentInsurance: 0.005, // 失业保险 个人缴费比例为0.5%;
        housingFund: 0.07, // 住房公积金 7%
        supplementaryFund: 0.05, // 补充公积金 5%
    },
    extraBonus = [], // 每月额外奖金
    housingFundRange = {min: 2690, max: 36920}, // 公积金计算上下限
} = {
}) {

    if (!insuranceAndFundBase) insuranceAndFundBase = salary;

    const awardsPreTax = salary * yearEndAwardsNumber; // 税前年终奖
    const result = {
        salaryPreTax: salary, // 税前月薪
        salaryAfterTax: [], // 每月税后收入
        salaryTax: [], // 每月个人所得税
        totalSalaryPreTax: awardsPreTax + salary * 12, // 税前年总收入
        totalSalaryAfterTax: 0, // 税后年总收入
        insuranceAndFund: calculateInsuranceAndFund(
            insuranceAndFundBase,
            insuranceAndFundRate,
            housingFundRange,
        ), // 五险一金
        awardsPreTax, // 税前年终奖
        awardsTax: 0,
        awardsAfterTax: 0, // 税后年终奖
    };

    let totalPersonalTncomeTax = 0; // 累计个人所得税缴税额

    for (let i = 1; i < 13; i++) {
        const cumulativePreTaxIncome = i * salary + (extraBonus[i - 1] || 0); // 累计应税收入 todo 额外津贴奖金
        const accumulatedTaxFreeIncome = 0; // 累计免税收入 todo
        const cumulativeDeductions = startingSalary * i; // 累计减除费用
        const cumulativeSpecialDeduction = result.insuranceAndFund.totalFund * i; // 累计专项扣除
        const accumulatedSpecialAdditionalDeductions = specialAdditionalDeduction * i; // 累计专项附加扣除
        const others = 0; // todo

        // 累计应纳税所得额 = 累计应税收入 - 累计免税收入 - 累计减除费用 - 累计专项扣除 - 累计专项附加扣除 - 累计依法确定的其他扣除
        const accumulatedTaxableIncome =  // 累计应纳税所得额
            cumulativePreTaxIncome - accumulatedTaxFreeIncome - cumulativeDeductions -
            cumulativeSpecialDeduction - accumulatedSpecialAdditionalDeductions - others;

        const salaryTax = calculatePersionalIncomeTax({
            accumulatedTaxableIncome,
            totalPersonalTncomeTax
        }); // 当月个人所得税

        const salaryAfterTax = salary - result.insuranceAndFund.totalFund - salaryTax;
        result.salaryAfterTax.push(salaryAfterTax);
        result.salaryTax.push(salaryTax);
        result.totalSalaryAfterTax += salaryAfterTax;

        totalPersonalTncomeTax += salaryTax; // 累计个人所得税缴税额
    }

    // 计算年终奖
    const awardsTax = calculateYearEndAwardsTax({
        salary,
        awardsPreTax,
        startingSalary,
    });

    result.awardsTax = awardsTax;
    result.awardsAfterTax = awardsPreTax - awardsTax;

    result.totalSalaryAfterTax += result.awardsAfterTax;

    return result;
}

// 年终奖计税
function calculateYearEndAwardsTax ({
    salary, // 月基础工资
    awardsPreTax, // 税前年终奖
    startingSalary,
}) {

    const base = (salary > startingSalary)
        ? awardsPreTax
        : (awardsPreTax - (startingSalary - salary));

    const {rate, deduction} = countYearEndAwardsLevel(base / 12);
    return base * rate - deduction;
    // 年终奖个人所得税计算方式：
    // 1、发放年终奖的当月工资高于5000元时，年终奖扣税方式为：年终奖乘税率-速算扣除数，税率是按年终奖/12作为"应纳税所得额"对应的税率。
    // 2、当月工资低于5000元时，年终奖个人所得税=(年终奖-(5000-月工资))乘税率-速算扣除数，税率是按年终奖-(5000-月工资)除以12作为"应纳税所得额"对应的税率。
}

// 五险一金计算器
function calculateInsuranceAndFund (base, rate, housingFundRange) {
    const result = {};
    let totalFund = 0;

    for (const k in rate) {

        let countBase = base;

        if (k === 'housingFund' || k === 'supplementaryFund') {
            if (base < housingFundRange.min) {
                countBase = housingFundRange.min;
            } else if (base > housingFundRange.max) {
                countBase = housingFundRange.max;
            }
        }

        const value = rate[k] * countBase;
        result[k] = value;
        totalFund += value;
    }
    result.totalFund = totalFund;
    result.totalHousingFund = result.housingFund + result.supplementaryFund;
    return result;
}

function calculatePersionalIncomeTax ({
    accumulatedTaxableIncome,
    totalPersonalTncomeTax
}) {
    const {rate, deduction} = countMonthSalayLevel(accumulatedTaxableIncome);

    // 当月个税 = （累计应纳税所得额 * 预扣率 - 速算扣除数）- 累计减免税额【0】 - 累计已缴税额
    const accumulatedTaxDeduction = 0;
    return accumulatedTaxableIncome * rate - deduction
         - accumulatedTaxDeduction - totalPersonalTncomeTax;
}

function countMonthSalayLevel (accumulatedTaxableIncome) {
    const levels = [
        {value: 36000, rate: 0.03, deduction: 0},
        {value: 144000, rate: 0.1, deduction: 2520},
        {value: 300000, rate: 0.2, deduction: 16920},
        {value: 420000, rate: 0.25, deduction: 31920},
        {value: 660000, rate: 0.3, deduction: 52920},
        {value: 960000, rate: 0.35, deduction: 85920},
        {value: 0, rate: 0.45, deduction: 181920},
    ];

    return countLevel(accumulatedTaxableIncome, levels);
}

function countYearEndAwardsLevel (avgPreTaxYearEndAwards) {
    const levels = [
        {value: 3000, rate: 0.03, deduction: 0},
        {value: 12000, rate: 0.1, deduction: 210},
        {value: 25000, rate: 0.2, deduction: 1410},
        {value: 35000, rate: 0.25, deduction: 2660},
        {value: 55000, rate: 0.3, deduction: 4410},
        {value: 80000, rate: 0.35, deduction: 7360},
        {value: 0, rate: 0.45, deduction: 15160},
    ];

    return countLevel(avgPreTaxYearEndAwards, levels);
}

function countLevel (salary, levels) {

    for (let i = 0; i < levels.length; i++) {
        const {value, rate, deduction} = levels[i];
        if (value === 0 || value > salary) {
            return {rate, deduction};
        }
    }
    return {rate: 0, deduction: 0};
}

// 1.年度不超过36000元的税率为: 3% 速算扣除数: 0

// 2.超过36000-144000元的部分税率为: 10% 速算扣除数: 2520

// 3.超过144000-300000元的部分税率为: 20% 速算扣除数: 16920

// 4.超过300000-420000元的部分税率为: 25% 速算扣除数: 31920

// 5.超过420000-660000元的部分税率为: 30% 速算扣除数: 52920

// 6.超过660000-960000元的部分税率为: 35% 速算扣除数: 85920

// 7.超过960000元的税率为: 45% 速算扣除数: 181920


/**
 
countSalary({
    salary: 53000, //
    specialAdditionalDeduction: 1500, // 每月专项附加扣除 租房扣除
    yearEndAwardsNumber: 3, // 年终奖月数
    insuranceAndFundBase, // 五险一金计算基础，为上一年度平均薪资，默认为salary
    startingSalary: 5000, // 个税起征点
    insuranceAndFundRate: {
        pension: 0.08, // 养老保险 个人缴费费率为8%;
        medicalInsurance: 0.02, // 医疗保险 个人缴费比例为2%;
        unemploymentInsurance: 0.005, // 失业保险 个人缴费比例为0.5%;
        housingFund: 0.07, // 住房公积金 7%
        supplementaryFund: 0.05, // 补充公积金 5%
    },
    extraBonus: [], // 每月额外奖金
});
 */