import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

type ContractType = 'unlimited' | 'limited';

function calculateGratuity(
  basicSalary: number,
  years: number,
  months: number,
  contractType: ContractType,
  resigned: boolean
): { gratuity: number; breakdown: string[] } {
  const totalYears = years + months / 12;
  const breakdown: string[] = [];

  if (totalYears < 1) {
    return { gratuity: 0, breakdown: ['No gratuity is payable for service less than 1 year.'] };
  }

  const dailyWage = basicSalary / 30;
  let gratuity = 0;

  if (contractType === 'unlimited') {
    if (resigned) {
      // Resignation on unlimited contract
      if (totalYears < 1) {
        return { gratuity: 0, breakdown: ['No gratuity for resignation before 1 year.'] };
      } else if (totalYears < 3) {
        return { gratuity: 0, breakdown: ['No gratuity for resignation before completing 3 years on unlimited contract.'] };
      } else if (totalYears < 5) {
        // 1/3 of 21 days for first 5 years
        const firstPart = Math.min(totalYears, 5) * 21 * dailyWage;
        gratuity = firstPart / 3;
        breakdown.push(`Service: ${totalYears.toFixed(1)} years (resigned, 1-5 years → 1/3 of gratuity)`);
        breakdown.push(`21 days × ${totalYears.toFixed(1)} years × AED ${dailyWage.toFixed(2)}/day = AED ${(totalYears * 21 * dailyWage).toFixed(2)}`);
        breakdown.push(`1/3 of above = AED ${gratuity.toFixed(2)}`);
      } else {
        // Full gratuity
        const first5 = 5 * 21 * dailyWage;
        const remaining = (totalYears - 5) * 30 * dailyWage;
        gratuity = first5 + remaining;
        breakdown.push(`First 5 years: 21 days × 5 × AED ${dailyWage.toFixed(2)} = AED ${first5.toFixed(2)}`);
        if (totalYears > 5) {
          breakdown.push(`Remaining ${(totalYears - 5).toFixed(1)} years: 30 days × ${(totalYears - 5).toFixed(1)} × AED ${dailyWage.toFixed(2)} = AED ${remaining.toFixed(2)}`);
        }
      }
    } else {
      // Termination on unlimited contract
      const first5 = Math.min(totalYears, 5) * 21 * dailyWage;
      breakdown.push(`First ${Math.min(totalYears, 5).toFixed(1)} years: 21 days × ${Math.min(totalYears, 5).toFixed(1)} × AED ${dailyWage.toFixed(2)} = AED ${first5.toFixed(2)}`);
      gratuity = first5;

      if (totalYears > 5) {
        const remaining = (totalYears - 5) * 30 * dailyWage;
        breakdown.push(`Remaining ${(totalYears - 5).toFixed(1)} years: 30 days × ${(totalYears - 5).toFixed(1)} × AED ${dailyWage.toFixed(2)} = AED ${remaining.toFixed(2)}`);
        gratuity += remaining;
      }
    }
  } else {
    // Limited contract
    if (resigned && totalYears < 1) {
      return { gratuity: 0, breakdown: ['No gratuity for service less than 1 year.'] };
    }

    const first5 = Math.min(totalYears, 5) * 21 * dailyWage;
    breakdown.push(`First ${Math.min(totalYears, 5).toFixed(1)} years: 21 days × ${Math.min(totalYears, 5).toFixed(1)} × AED ${dailyWage.toFixed(2)} = AED ${first5.toFixed(2)}`);
    gratuity = first5;

    if (totalYears > 5) {
      const remaining = (totalYears - 5) * 30 * dailyWage;
      breakdown.push(`Remaining ${(totalYears - 5).toFixed(1)} years: 30 days × ${(totalYears - 5).toFixed(1)} × AED ${dailyWage.toFixed(2)} = AED ${remaining.toFixed(2)}`);
      gratuity += remaining;
    }
  }

  // Cap: total gratuity cannot exceed 2 years' salary
  const cap = basicSalary * 24;
  if (gratuity > cap) {
    gratuity = cap;
    breakdown.push(`Capped at 2 years' salary: AED ${cap.toFixed(2)}`);
  }

  return { gratuity: Math.round(gratuity), breakdown };
}

export default function GratuityCalculator() {
  const [basicSalary, setBasicSalary] = useState<string>('');
  const [years, setYears] = useState<string>('');
  const [months, setMonths] = useState<string>('0');
  const [contractType, setContractType] = useState<ContractType>('unlimited');
  const [resigned, setResigned] = useState(false);
  const [result, setResult] = useState<{ gratuity: number; breakdown: string[] } | null>(null);

  const handleCalculate = () => {
    const salary = parseFloat(basicSalary);
    const yrs = parseInt(years) || 0;
    const mos = parseInt(months) || 0;
    if (!salary || salary <= 0) return;
    const res = calculateGratuity(salary, yrs, mos, contractType, resigned);
    setResult(res);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>UAE Gratuity Calculator 2026 | End of Service Benefits | CV Hive</title>
        <meta name="description" content="Calculate your UAE end of service gratuity benefits. Free calculator based on UAE Labour Law for unlimited and limited contracts." />
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Based on UAE Labour Law
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">UAE Gratuity Calculator</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Calculate your end-of-service benefits under UAE Labour Law. Enter your details below to see your estimated gratuity amount.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Basic Monthly Salary (AED)</label>
                <input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Basic salary only (excluding allowances)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contract Type</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as ContractType)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                  <option value="unlimited">Unlimited Contract</option>
                  <option value="limited">Limited (Fixed-Term) Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Service</label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="e.g. 5"
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Months</label>
                <select
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>{i} months</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Leaving</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      checked={!resigned}
                      onChange={() => setResigned(false)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Termination by employer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      checked={resigned}
                      onChange={() => setResigned(true)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Resignation</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Calculate Gratuity
            </button>

            {result && (
              <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 mb-1">Estimated End-of-Service Gratuity</p>
                  <p className="text-4xl font-bold text-primary">AED {result.gratuity.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Breakdown:</p>
                  {result.breakdown.map((line, i) => (
                    <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How UAE Gratuity Works</h2>
          <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">First 5 Years</h3>
                <p>21 days' basic salary for each year of service.</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">After 5 Years</h3>
                <p>30 days' basic salary for each additional year beyond the first 5.</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Resignation (Unlimited)</h3>
                <p>If you resign before 3 years, no gratuity is payable. Between 3-5 years, you receive 1/3. After 5 years, you receive the full amount.</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Maximum Cap</h3>
                <p>Total gratuity cannot exceed 2 years' worth of basic salary regardless of length of service.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Important Notes</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>Gratuity is calculated on <strong>basic salary only</strong>, not total package (excludes allowances, bonuses, commissions).</li>
                <li>The daily wage is calculated as: Basic Salary ÷ 30 days.</li>
                <li>Under UAE Labour Law (Federal Decree-Law No. 33 of 2021), employees are entitled to gratuity after completing 1 year of service.</li>
                <li>This calculator provides an estimate. Consult MOHRE or a legal advisor for exact calculations.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/salary-guide" className="btn btn-primary">View Salary Guide</Link>
            <Link to="/career-advice" className="btn btn-secondary">Career Advice</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
