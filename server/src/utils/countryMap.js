const countries = {
  "US": { name: "United States", flag: "🇺🇸" },
  "IN": { name: "India", flag: "🇮🇳" },
  "GB": { name: "United Kingdom", flag: "🇬🇧" },
  "CA": { name: "Canada", flag: "🇨🇦" },
  "DE": { name: "Germany", flag: "🇩🇪" },
  "FR": { name: "France", flag: "🇫🇷" },
  "JP": { name: "Japan", flag: "🇯🇵" },
  "CN": { name: "China", flag: "🇨🇳" },
  "BR": { name: "Brazil", flag: "🇧🇷" },
  "AU": { name: "Australia", flag: "🇦🇺" },
  "RU": { name: "Russia", flag: "🇷🇺" },
  "IT": { name: "Italy", flag: "🇮🇹" },
  "ES": { name: "Spain", flag: "🇪🇸" },
  "MX": { name: "Mexico", flag: "🇲🇽" },
  "KR": { name: "South Korea", flag: "🇰🇷" },
  "NL": { name: "Netherlands", flag: "🇳🇱" },
  "CH": { name: "Switzerland", flag: "🇨🇭" },
  "SE": { name: "Sweden", flag: "🇸🇪" },
  "DK": { name: "Denmark", flag: "🇩🇰" },
  "NO": { name: "Norway", flag: "🇳🇴" },
  "FI": { name: "Finland", flag: "🇫🇮" },
  "SG": { name: "Singapore", flag: "🇸🇬" },
  "AE": { name: "United Arab Emirates", flag: "🇦🇪" },
};

function getCountryInfo(code) {
  return countries[code] || { name: code || "Unknown", flag: "🌍" };
}

module.exports = { getCountryInfo };
