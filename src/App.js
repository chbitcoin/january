import React from "react";

const { useState, useEffect } = React;

// Metrics Card Component
const MetricsCard = ({ title, value }) => (
  <div className="bg-opacity-50 p-2 rounded-lg shadow-md hover:bg-gray-900 font">
    <h3 className="text-xs text-gray-400">{title}</h3>
    <p className="text-base">{value}</p>
  </div>
);

// Main Dashboard Component
function App() {
  const [data, setData] = useState({
    mempoolSize: "Loading...",
    mempoolPendingFees: "Loading...",
    price: "Loading...",
    priceEUR: "Loading...",
    priceGBP: "Loading...",
    priceCAD: "Loading...",
    priceCHF: "Loading...",
    priceAUD: "Loading...",
    priceJPY: "Loading...",
    lnChannelCount: "Loading...",
    lnNodeCount: "Loading...",
    lnCapacity: "Loading...",
    lnTorNodes: "Loading...",
    lnClearNodes: "Loading...",
    lnUnknownNodes: "Loading...",
    transactionCount: "Loading...",
    hashrate: "Loading...",
    difficulty: "Loading...",
    blockHeight: "Loading...",
    issuedSupply: "Loading...",
  });
  const [error, setError] = useState(null);
  const [millions, setMillions] = useState(false);

  // Fetch data from mempool.space API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch mempool stats
        const mempoolResponse = await fetch(
          "https://mempool.space/api/mempool"
        );
        if (!mempoolResponse.ok)
          throw new Error("Failed to fetch mempool stats");
        const mempoolData = await mempoolResponse.json();

        // Fetch price
        const priceResponse = await fetch(
          "https://mempool.space/api/v1/prices"
        );
        if (!priceResponse.ok) throw new Error("Failed to fetch price");
        const priceData = await priceResponse.json();

        // Fetch lightning stats
        const lnResponse = await fetch(
          "https://mempool.space/api/v1/lightning/statistics/latest"
        );
        if (!lnResponse.ok) throw new Error("Failed to fetch lightning stats");
        const lnData = await lnResponse.json();

        // Fetch block height
        const heightResponse = await fetch(
          "https://mempool.space/api/blocks/tip/height"
        );
        if (!heightResponse.ok) throw new Error("Failed to fetch block height");
        const blockHeight = await heightResponse.json();

        // Fetch hashrate
        const hashrateResponse = await fetch(
          "https://mempool.space/api/v1/mining/hashrate/3d"
        );
        if (!hashrateResponse.ok) throw new Error("Failed to fetch hashrate");
        const hashrateData = await hashrateResponse.json();

        // Fetch gold price
        const goldResponse = await fetch("https://api.gold-api.com/price/XAU");
        if (!goldResponse.ok) throw new Error("Failed to fetch gold price");
        const goldData = await goldResponse.json();

        // Format data
        setData({
          mempoolSize: `${(mempoolData.vsize / 1000).toFixed(2)}`,
          mempoolPendingFees: `${mempoolData.total_fee}`,
          price: `${priceData.USD}`,
          priceEUR: `${priceData.EUR}`,
          priceGBP: `${priceData.GBP}`,
          priceCAD: `${priceData.CAD}`,
          priceCHF: `${priceData.CHF}`,
          priceAUD: `${priceData.AUD}`,
          priceJPY: `${priceData.JPY}`,
          lnChannelCount: `${lnData.latest.channel_count}`,
          lnNodeCount: `${lnData.latest.node_count}`,
          lnCapacity: `${lnData.latest.total_capacity}`,
          lnTorNodes: `${lnData.latest.tor_nodes}`,
          transactionCount: mempoolData.count.toLocaleString(),
          hashrate: `${(hashrateData.currentHashrate / 1e18).toFixed(2)} EH/s`,
          difficulty: `${hashrateData.currentDifficulty}`,
          blockHeight: blockHeight.toLocaleString(),
          issuedSupply: (
            calculateTotalSupply(blockHeight) / 100000000
          ).toLocaleString(),
          goldPrice: goldData.price,
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        setData({
          mempoolSize: "Error",
          mempoolPendingFees: "Error",
          price: "Error",
          priceEUR: "Error",
          priceGBP: "Error",
          priceCAD: "Error",
          priceCHF: "Error",
          priceAUD: "Error",
          priceJPY: "Error",
          lnChannelCount: "Error",
          lnNodeCount: "Error",
          lnCapacity: "Error",
          lnTorNodes: "Error",
          transactionCount: "Error",
          hashrate: "Error",
          difficulty: "Error",
          blockHeight: "Error",
          issuedSupply: "Error",
          goldPrice: "Error",
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const calculateTotalSupply = (height) => {
    const halvingInterval = 210000;
    const initialReward = 50 * 100000000; // satoshis (50 BTC = 5,000,000,000 satoshis)
    let totalSupply = 0;
    let reward = initialReward;
    let currentBlock = 0;

    while (reward > 0 && currentBlock <= height) {
      let eraEnd = Math.min(height, currentBlock + halvingInterval - 1);
      let blocksInThisEra = eraEnd - currentBlock + 1;
      totalSupply += blocksInThisEra * reward;
      reward = Math.floor(reward / 2);
      currentBlock += halvingInterval;
    }

    return totalSupply;
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price; // Fallback for "Loading..." or "Error"
    if (millions) {
      return (num / 1000000).toFixed(2) + "M";
    } else {
      return num.toLocaleString();
    }
  };

  const toggleMillions = () => {
    setMillions(!millions);
  };

  return (
    <div>
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4 font-sans">
          Error: {error}. Please try again later.
        </div>
      )}
      <div className="box">
        <div className="lg:text-[10em] sm:text-9xl text-8xl p-5">
          {data.blockHeight?.replace(/,/g, "")}
        </div>
      </div>
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2 p-6 text-center font">
        <div className="border-solid border rounded-xl border-gray-800 2xl:p-4 2xl:m-3 xl:p-4 xl:m-3 lg:p-4 lg:m-3 md:p-3 md:m-2 sm:p-2 sm:m-2 p-3 m-1">
          <div className="flex flex-col">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <h1>Fiat</h1>
              <button
                onClick={toggleMillions}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                  millions
                    ? "bg-[#FF9900] text-white shadow-md"
                    : "bg-gray-700 text-gray-400"
                }`}
                title="Display fiat values in millions"
              >
                M
              </button>
            </div>
          </div>
          <MetricsCard
            title="USD per bitcoin"
            value={formatPrice(data.price)}
          />
          <MetricsCard
            title="EUR per bitcoin"
            value={formatPrice(data.priceEUR)}
          />
          <MetricsCard
            title="GBP per bitcoin"
            value={formatPrice(data.priceGBP)}
          />
          <MetricsCard
            title="CAD per bitcoin"
            value={formatPrice(data.priceCAD)}
          />
          <MetricsCard
            title="CHF per bitcoin"
            value={formatPrice(data.priceCHF)}
          />
          <MetricsCard
            title="AUD per bitcoin"
            value={formatPrice(data.priceAUD)}
          />
          <MetricsCard
            title="JPY per bitcoin"
            value={formatPrice(data.priceJPY)}
          />
        </div>
        <div className="border-solid border rounded-xl border-gray-800 2xl:p-4 2xl:m-3 xl:p-4 xl:m-3 lg:p-4 lg:m-3 md:p-3 md:m-2 sm:p-2 sm:m-2 p-3 m-1">
          <h1>Lightning</h1>
          <MetricsCard
            title="Total capacity (BTC)"
            value={parseFloat(
              (data.lnCapacity / 100000000).toFixed(0)
            ).toLocaleString()}
          />
          <MetricsCard
            title="Channel count"
            value={parseFloat(data.lnChannelCount).toLocaleString()}
          />
          <MetricsCard
            title="Ave. channel capacity (sats)"
            value={parseFloat(
              (data.lnCapacity / data.lnChannelCount).toFixed(0)
            ).toLocaleString()}
          />
          <MetricsCard
            title="Node count"
            value={parseFloat(data.lnNodeCount).toLocaleString()}
          />
          <MetricsCard
            title="Ave. node capacity (sats)"
            value={parseFloat(
              (data.lnCapacity / data.lnNodeCount).toFixed(0)
            ).toLocaleString()}
          />
          <MetricsCard
            title="Tor nodes (%)"
            value={((data.lnTorNodes / data.lnNodeCount) * 100).toFixed(1)}
          />
        </div>
        <div className="border-solid border rounded-xl border-gray-800 2xl:p-4 2xl:m-3 xl:p-4 xl:m-3 lg:p-4 lg:m-3 md:p-3 md:m-2 sm:p-2 sm:m-2 p-3 m-1">
          <h1>Mempool</h1>
          <MetricsCard
            title="Pending Transactions"
            value={data.transactionCount}
          />
          <MetricsCard
            title="Mempool Size (MB)"
            value={parseFloat(
              (data.mempoolSize / 1000).toFixed(2)
            ).toLocaleString()}
          />
          <MetricsCard
            title="Mempool Pending Fees (sats)"
            value={parseFloat(data.mempoolPendingFees).toLocaleString()}
          />
        </div>
        <div className="border-solid border rounded-xl border-gray-800 2xl:p-4 2xl:m-3 xl:p-4 xl:m-3 lg:p-4 lg:m-3 md:p-3 md:m-2 sm:p-2 sm:m-2 p-3 m-1">
          <h1>Network</h1>
          <MetricsCard
            title="Issued supply (BTC)"
            value={(
              parseFloat(data.issuedSupply?.replace(/,/g, "")).toFixed(0) * 1
            ).toLocaleString()}
          />
          <MetricsCard
            title="Issued supply (%)"
            value={(
              (parseFloat(data.issuedSupply?.replace(/,/g, "")) / 21000000) *
              100
            ).toFixed(1)}
          />
          <MetricsCard
            title="Hashrate (EH/s)"
            value={data.hashrate.split(" ")[0]}
          />
          <MetricsCard
            title="Difficulty"
            value={parseFloat(data.difficulty / 1000000000000).toFixed(2) + `T`}
          />
          <MetricsCard
            title="Subsidy epoch"
            value={
              Math.floor(
                parseFloat(data.blockHeight?.replace(/,/g, "")) / 210000
              ) + 1
            }
          />
          <MetricsCard
            title="Halving progress (%)"
            value={(
              (((Math.floor(
                parseFloat(data.blockHeight?.replace(/,/g, "")) / 210000
              ) +
                1) *
                210000 -
                parseFloat(data.blockHeight?.replace(/,/g, ""))) /
                210000) *
              100
            ).toFixed(1)}
          />
          <MetricsCard
            title="Difficulty epoch"
            value={
              Math.floor(
                parseFloat(data.blockHeight?.replace(/,/g, "")) / 2016
              ) + 1
            }
          />
        </div>
        <div className="border-solid border rounded-xl border-gray-800 2xl:p-4 2xl:m-3 xl:p-4 xl:m-3 lg:p-4 lg:m-3 md:p-3 md:m-2 sm:p-2 sm:m-2 p-3 m-1">
          <h1>Gold</h1>
          <MetricsCard
            title="USD per gold (oz)"
            value={parseFloat(data.goldPrice?.toFixed(0)).toLocaleString()}
          />
          <MetricsCard
            title="Gold per bitcoin (oz)"
            value={(data.price / data.goldPrice).toFixed(2)}
          />
          <MetricsCard
            title="Bitcoin per oz gold (sats)"
            value={parseFloat(
              ((data.goldPrice / data.price) * 100000000).toFixed(0)
            ).toLocaleString()}
          />
          <MetricsCard
            title="Bitcoin vs gold market cap (%)"
            value={(
              ((parseFloat(data.issuedSupply?.replace(/,/g, "")) * data.price) /
                (6850000000 * data.goldPrice)) *
              100
            ).toFixed(2)}
          />
          <MetricsCard
            title="USD per bitcoin @ gold market cap"
            value={parseFloat(
              ((6850000000 * data.goldPrice) / 21000000).toFixed(0)
            ).toLocaleString()}
          />
        </div>
      </div>{" "}
      <footer className="pb-10 text-center text-gray-400 text-sm">
        <div className="flex justify-center space-x-6">
          <a
            href="https://x.com/coldhardbtc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF9900] transition-colors"
          >
            X
          </a>
          <a
            href="https://bitcoin.org/bitcoin.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF9900] transition-colors"
          >
            Whitepaper
          </a>
          <a
            href="https://mempool.space/docs/api/rest"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF9900] transition-colors"
          >
            API
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
