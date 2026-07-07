import React, { useState } from "react";
import { DollarSign, Percent, RefreshCw, Calculator } from "lucide-react";

function Converter() {
    const [budget, setBudget] = useState(1000);
    const [currency, setCurrency] = useState("USD");
    const [targetCurrency, setTargetCurrency] = useState("INR");
    const [cpc, setCpc] = useState(0.15); // Cost Per Click
    const [ctr, setCtr] = useState(2.5);  // Click-Through Rate (%)

    // Mock exchange rates relative to USD
    const exchangeRates = {
        USD: 1,
        INR: 83.5,
        EUR: 0.92,
        GBP: 0.79,
        CAD: 1.36
    };

    // Calculate conversions
    const convertBudget = () => {
        const budgetInUSD = budget / exchangeRates[currency];
        const convertedBudget = budgetInUSD * exchangeRates[targetCurrency];
        
        // Calculate campaign yields
        const totalClicks = Math.round(budgetInUSD / cpc);
        const totalImpressions = Math.round((totalClicks / (ctr / 100)));

        return {
            convertedBudget: convertedBudget.toFixed(2),
            totalClicks: totalClicks.toLocaleString(),
            totalImpressions: totalImpressions.toLocaleString()
        };
    };

    const results = convertBudget();

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Form Panel */}
            <div className="bg-[#14121a] border border-[#201d2a] p-6 rounded-2xl space-y-6">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2.5 m-0">
                    <Calculator className="w-5 h-5 text-indigo-400" />
                    Campaign Estimates
                </h2>

                <div className="space-y-4">
                    {/* Budget & Input Currency */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Ad-Spend Budget
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(Number(e.target.value))}
                                className="flex-1 bg-[#1c1924] border border-[#2c2838] px-4 py-3 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500"
                            />
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="bg-[#1c1924] border border-[#2c2838] px-4 py-3 rounded-xl text-white font-semibold focus:outline-none"
                            >
                                {Object.keys(exchangeRates).map((cur) => (
                                    <option key={cur} value={cur}>{cur}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Target Currency */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Conversion Target Currency
                        </label>
                        <select
                            value={targetCurrency}
                            onChange={(e) => setTargetCurrency(e.target.value)}
                            className="w-full bg-[#1c1924] border border-[#2c2838] px-4 py-3 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500"
                        >
                            {Object.keys(exchangeRates).map((cur) => (
                                <option key={cur} value={cur}>{cur}</option>
                            ))}
                        </select>
                    </div>

                    {/* Cost Per Click */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                            Avg CPC ($ USD)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={cpc}
                            onChange={(e) => setCpc(Number(e.target.value))}
                            className="w-full bg-[#1c1924] border border-[#2c2838] px-4 py-3 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Click Through Rate */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Estimated CTR (%)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={ctr}
                            onChange={(e) => setCtr(Number(e.target.value))}
                            className="w-full bg-[#1c1924] border border-[#2c2838] px-4 py-3 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Calculations Result Output */}
            <div className="bg-gradient-to-br from-indigo-900/10 to-violet-900/5 border border-[#201d2a] p-6 rounded-2xl flex flex-col justify-between">
                <div>
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2.5 m-0 mb-6">
                        <RefreshCw className="w-5 h-5 text-indigo-400" />
                        Conversion Estimates
                    </h2>

                    <div className="space-y-6">
                        {/* Converted Budget */}
                        <div className="bg-[#14121a]/85 p-5 rounded-xl border border-[#201d2a]">
                            <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Converted Budget
                            </span>
                            <span className="text-3xl font-black text-indigo-400">
                                {results.convertedBudget} {targetCurrency}
                            </span>
                        </div>

                        {/* Impressions/Clicks */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#14121a]/85 p-4 rounded-xl border border-[#201d2a]">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                    Expected Clicks
                                </span>
                                <span className="text-lg font-black text-white">
                                    {results.totalClicks}
                                </span>
                            </div>
                            <div className="bg-[#14121a]/85 p-4 rounded-xl border border-[#201d2a]">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                    Impressions (Est.)
                                </span>
                                <span className="text-lg font-black text-white">
                                    {results.totalImpressions}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/25 p-4 rounded-xl text-center text-xs text-indigo-300 font-semibold mt-6">
                    Rates are mock values indexed to USD. Yield metrics are estimations based on campaign CTR inputs.
                </div>
            </div>
        </div>
    );
}

export default Converter;
