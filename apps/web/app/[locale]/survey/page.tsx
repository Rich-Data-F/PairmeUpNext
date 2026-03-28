"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Brand = { id: string; name: string; slug: string };
type Model = { id: string; name: string; slug: string };

type SurveySummary = {
  total: number;
  averages: {
    battery: string;
    delay: string;
    robustness: string;
    music: string;
    noiseReduction: string;
  };
  localization: {
    supportCount: number;
    savedLifeCount: number;
  };
};

const MUSIC_STYLES = ['Classic', 'Rap/Hip-Hop', 'Folk/Country', 'Drum & Bass', 'Techno/Electronic', 'Pop', 'Rock', 'Other'];
const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' }, { code: 'AO', name: 'Angola' }, { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' }, { code: 'AM', name: 'Armenia' }, { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' }, { code: 'BE', name: 'Belgium' }, { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' }, { code: 'BT', name: 'Bhutan' }, { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' }, { code: 'BW', name: 'Botswana' }, { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgaria' }, { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' }, { code: 'CV', name: 'Cabo Verde' }, { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' }, { code: 'CA', name: 'Canada' }, { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' }, { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' }, { code: 'KM', name: 'Comoros' }, { code: 'CD', name: 'Congo, Democratic Republic of the' },
  { code: 'CG', name: 'Congo, Republic of the' }, { code: 'CR', name: 'Costa Rica' }, { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'HR', name: 'Croatia' }, { code: 'CU', name: 'Cuba' }, { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czechia' }, { code: 'DK', name: 'Denmark' }, { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' }, { code: 'DO', name: 'Dominican Republic' }, { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' }, { code: 'SV', name: 'El Salvador' }, { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' }, { code: 'EE', name: 'Estonia' }, { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' }, { code: 'FJ', name: 'Fiji' }, { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' }, { code: 'GA', name: 'Gabon' }, { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' }, { code: 'DE', name: 'Germany' }, { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' }, { code: 'GD', name: 'Grenada' }, { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' }, { code: 'GW', name: 'Guinea-Bissau' }, { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' }, { code: 'HN', name: 'Honduras' }, { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' }, { code: 'IN', name: 'India' }, { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' }, { code: 'IQ', name: 'Iraq' }, { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' }, { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' }, { code: 'JO', name: 'Jordan' }, { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' }, { code: 'KI', name: 'Kiribati' }, { code: 'KP', name: 'Korea, North' },
  { code: 'KR', name: 'Korea, South' }, { code: 'KW', name: 'Kuwait' }, { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' }, { code: 'LV', name: 'Latvia' }, { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' }, { code: 'LR', name: 'Liberia' }, { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' }, { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' }, { code: 'MW', name: 'Malawi' }, { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' }, { code: 'ML', name: 'Mali' }, { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' }, { code: 'MR', name: 'Mauritania' }, { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' }, { code: 'FM', name: 'Micronesia' }, { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' }, { code: 'MN', name: 'Mongolia' }, { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' }, { code: 'MZ', name: 'Mozambique' }, { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' }, { code: 'NR', name: 'Nauru' }, { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' }, { code: 'NZ', name: 'New Zealand' }, { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' }, { code: 'NG', name: 'Nigeria' }, { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' }, { code: 'OM', name: 'Oman' }, { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' }, { code: 'PA', name: 'Panama' }, { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' }, { code: 'PE', name: 'Peru' }, { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' }, { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' }, { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' }, { code: 'LC', name: 'Saint Lucia' }, { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' }, { code: 'SM', name: 'San Marino' }, { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' }, { code: 'SN', name: 'Senegal' }, { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' }, { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' }, { code: 'SI', name: 'Slovenia' }, { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' }, { code: 'ZA', name: 'South Africa' }, { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' }, { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' }, { code: 'SE', name: 'Sweden' }, { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' }, { code: 'TW', name: 'Taiwan' }, { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' }, { code: 'TH', name: 'Thailand' }, { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' }, { code: 'TO', name: 'Tonga' }, { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' }, { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' }, { code: 'UG', name: 'Uganda' }, { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' }, { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' }, { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' }, { code: 'VE', name: 'Venezuela' }, { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' }, { code: 'ZM', name: 'Zambia' }, { code: 'ZW', name: 'Zimbabwe' },
];

export default function SurveyPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Stats
  const [summary, setSummary] = useState<SurveySummary | null>(null);

  // Identity
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [showCustomModel, setShowCustomModel] = useState(false);
  const [referenceString, setReferenceString] = useState('');

  // Dropdown states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  // Ratings
  const [batteryAutonomyRate, setBatteryAutonomyRate] = useState<number | ''>('');
  const [delaySyncRate, setDelaySyncRate] = useState<number | ''>('');
  const [robustnessRate, setRobustnessRate] = useState<number | ''>('');
  const [soundQualityVideo, setSoundQualityVideo] = useState<number | ''>('');
  const [soundQualityMusic, setSoundQualityMusic] = useState<number | ''>('');
  const [soundQualityPodcasts, setSoundQualityPodcasts] = useState<number | ''>('');
  const [noiseReductionRate, setNoiseReductionRate] = useState<number | ''>('');

  // Styles
  const [musicStyleMostListened, setMusicStyleMostListened] = useState('');
  const [musicStyleMostSuitable, setMusicStyleMostSuitable] = useState('');

  // Localization
  const [hasEarbudLocalization, setHasEarbudLocalization] = useState(false);
  const [earbudLocRate, setEarbudLocRate] = useState<number | ''>('');
  const [hasCaseLocalization, setHasCaseLocalization] = useState(false);
  const [caseLocRate, setCaseLocRate] = useState<number | ''>('');
  const [localizationType, setLocalizationType] = useState(''); // SOUND, MAP, BOTH
  const [localizationSavedLife, setLocalizationSavedLife] = useState(false);

  // Ownership Details
  const [dateOfPurchase, setDateOfPurchase] = useState('');
  const [usageDurationMonths, setUsageDurationMonths] = useState<number | ''>('');
  const [pricePaid, setPricePaid] = useState<number | ''>('');
  const [locationPurchase, setLocationPurchase] = useState('');
  const [countryOfPurchase, setCountryOfPurchase] = useState('');
  const [countryOfUsage, setCountryOfUsage] = useState('');

  // Loss & Replacement
  const [lossExperienceDetails, setLossExperienceDetails] = useState('');
  const [purchasedNewKit, setPurchasedNewKit] = useState(false);
  const [boughtSpareItem, setBoughtSpareItem] = useState(false);
  const [spareCondition, setSpareCondition] = useState(''); // NEW, USED
  const [sparePurchaseLocation, setSparePurchaseLocation] = useState('');

  // Auth check
  useEffect(() => {
    fetch('/api/proxy/auth/profile')
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  // Fetch Brands
  useEffect(() => {
    fetch('/api/proxy/brands/canonical')
      .then(r => r.json())
      .then(data => setBrands(data || []))
      .catch(console.error);
  }, []);

  // Fetch Summary
  useEffect(() => {
    fetch('/api/proxy/survey/summary')
      .then(r => r.json())
      .then(data => setSummary(data))
      .catch(console.error);
  }, []);

  // Fetch Models
  useEffect(() => {
    if (!brandId || brandId === 'custom') {
      setModels([]);
      return;
    }
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;
    
    fetch(`/api/proxy/brands/${brand.slug}`)
      .then(r => r.json())
      .then(data => setModels(data?.models || []))
      .catch(console.error);
  }, [brandId, brands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = {
      brandId: showCustomBrand ? undefined : brandId,
      modelId: showCustomModel ? undefined : modelId,
      customBrand: showCustomBrand ? customBrand : undefined,
      customModel: showCustomModel ? customModel : undefined,
      referenceString,
      batteryAutonomyRate: batteryAutonomyRate ? Number(batteryAutonomyRate) : undefined,
      delaySyncRate: delaySyncRate ? Number(delaySyncRate) : undefined,
      robustnessRate: robustnessRate ? Number(robustnessRate) : undefined,
      soundQualityVideo: soundQualityVideo ? Number(soundQualityVideo) : undefined,
      soundQualityMusic: soundQualityMusic ? Number(soundQualityMusic) : undefined,
      soundQualityPodcasts: soundQualityPodcasts ? Number(soundQualityPodcasts) : undefined,
      noiseReductionRate: noiseReductionRate ? Number(noiseReductionRate) : undefined,
      musicStyleMostListened,
      musicStyleMostSuitable,
      hasEarbudLocalization,
      earbudLocRate: hasEarbudLocalization && earbudLocRate ? Number(earbudLocRate) : undefined,
      hasCaseLocalization,
      caseLocRate: hasCaseLocalization && caseLocRate ? Number(caseLocRate) : undefined,
      localizationType: (hasEarbudLocalization || hasCaseLocalization) ? localizationType : undefined,
      localizationSavedLife: (hasEarbudLocalization || hasCaseLocalization) ? localizationSavedLife : undefined,
      dateOfPurchase: dateOfPurchase ? new Date(dateOfPurchase) : undefined,
      usageDurationMonths: usageDurationMonths ? Number(usageDurationMonths) : undefined,
      pricePaid: pricePaid ? Number(pricePaid) : undefined,
      locationPurchase,
      countryOfPurchase,
      countryOfUsage,
      lossExperienceDetails,
      purchasedNewKit,
      boughtSpareItem,
      spareCondition: boughtSpareItem ? spareCondition : undefined,
      sparePurchaseLocation: boughtSpareItem ? sparePurchaseLocation : undefined,
    };

    try {
      const resp = await fetch('/api/proxy/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to submit survey');
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authed === null) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (authed === false) {
    if (typeof window !== 'undefined') router.push('/auth/signin?next=/survey');
    return null;
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 my-10 bg-white rounded-xl shadow-lg border border-gray-100 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank you!</h1>
        <p className="text-gray-600 mb-8">Your honest feedback heavily impacts our community&apos;s recommendations and helps others make informed purchases.</p>
        <button onClick={() => router.push('/')} className="btn btn-primary">Return to Home</button>
      </div>
    );
  }

  const renderRatingGroup = (label: string, value: number | '', setValue: (val: number) => void) => (
    <div className="flex flex-col mb-4">
      <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(num => (
          <button
            type="button"
            key={num}
            onClick={() => setValue(num)}
            className={`w-10 h-10 rounded-full font-bold transition-all ${value === num ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {num}
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-400 mt-1 flex justify-between w-56"><span>Poor</span> <span>Excellent</span></span>
    </div>
  );

  const renderMiniChart = (val: string, label: string) => {
    const percentage = (parseFloat(val) / 5) * 100;
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
              strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * Number(val) / 5)}
              className="text-primary transition-all duration-1000" />
          </svg>
          <span className="absolute text-sm font-bold">{val}</span>
        </div>
        <span className="text-[10px] uppercase font-bold text-gray-400 mt-2 text-center leading-tight h-6 flex items-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-10 my-8 space-y-10">
      
      {/* Community Insights Dashboard */}
      {summary && summary.total > 0 && (
        <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-2xl border border-blue-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">Community Insights</h2>
              <p className="text-sm text-gray-400 font-medium italic">Aggregated from {summary.total} global earbud owners</p>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-primary text-xl font-black">{summary.total}</span>
              <span className="text-primary/70 text-xs font-bold uppercase tracking-widest">Responses</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 border-b pb-8 mb-8">
            {renderMiniChart(summary.averages.battery, 'Battery')}
            {renderMiniChart(summary.averages.music, 'Music Q.')}
            {renderMiniChart(summary.averages.noiseReduction, 'ANC')}
            {renderMiniChart(summary.averages.delay, 'Sync')}
            {renderMiniChart(summary.averages.robustness, 'Build')}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Localization Stats</h3>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl font-black">
                  {Math.round((summary.localization.supportCount / summary.total) * 100)}%
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-700">Market Adoption</div>
                  <p className="text-xs text-gray-400">Devices equipped with localization features</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Utility Impact</h3>
              <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-xl font-black">
                  {summary.localization.savedLifeCount}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-700">Wallet Saved</div>
                  <p className="text-xs text-gray-400">Users who avoided repurchasing thanks to tracking</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-4 py-3">Metric category</th>
                  <th className="px-4 py-3 text-right">Avg Rating</th>
                  <th className="px-4 py-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700">Soundstage for Music</td>
                  <td className="px-4 py-3 text-right font-black text-primary">{summary.averages.music}/5</td>
                  <td className="px-4 py-3 text-right"><span className="badge badge-success badge-xs">High</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700">Daily Life Battery</td>
                  <td className="px-4 py-3 text-right font-black text-primary">{summary.averages.battery}/5</td>
                  <td className="px-4 py-3 text-right"><span className="badge badge-success badge-xs">High</span></td>
                </tr>
                 <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700">Gaming & Video Latency</td>
                  <td className="px-4 py-3 text-right font-black text-primary">{summary.averages.delay}/5</td>
                  <td className="px-4 py-3 text-right"><span className="badge badge-warning badge-xs">Medium</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Survey Form */}
      <div className="bg-white shadow-xl rounded-2xl p-6 lg:p-10 border border-gray-100">
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 mb-2">Device Satisfaction Survey</h1>
          <p className="text-gray-500 font-medium leading-relaxed">Your data powers the transparency for future buyers. Help us map the real performance of earbud models.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Device Selection */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-3">
              <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shadow-lg shadow-blue-200">1</span> 
              Identify Your Device
            </h2>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 grid md:grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text font-bold text-gray-600">Brand</span></label>
                <select
                  className="select select-bordered w-full bg-white font-medium"
                  value={showCustomBrand ? 'custom' : brandId}
                  onChange={(e) => {
                    if (e.target.value === 'custom') { setShowCustomBrand(true); setBrandId(''); setModelId(''); setShowCustomModel(false); setCustomModel(''); }
                    else { setShowCustomBrand(false); setBrandId(e.target.value); setCustomBrand(''); }
                  }}
                  required
                >
                  <option value="" disabled>Select brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  <option value="custom">➕ Other Brand</option>
                </select>
                {showCustomBrand && <input className="input input-bordered w-full mt-2" placeholder="Describe Brand" value={customBrand} onChange={e => setCustomBrand(e.target.value)} required />}
              </div>

              <div>
                <label className="label"><span className="label-text font-bold text-gray-600">Model</span></label>
                <select
                  className="select select-bordered w-full bg-white font-medium"
                  value={showCustomModel ? 'custom' : modelId}
                  onChange={(e) => {
                    if (e.target.value === 'custom') { setShowCustomModel(true); setModelId(''); setCustomModel(''); }
                    else { setShowCustomModel(false); setModelId(e.target.value); setCustomModel(''); }
                  }}
                  required
                  disabled={showCustomBrand && !customBrand}
                >
                  <option value="" disabled>Select model</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  <option value="custom">➕ Other Model</option>
                </select>
                {showCustomModel && <input className="input input-bordered w-full mt-2" placeholder="Describe Model" value={customModel} onChange={e => setCustomModel(e.target.value)} required />}
              </div>
              
              <div className="md:col-span-2 mt-2">
                <label className="label"><span className="label-text text-gray-400 font-bold text-xs uppercase tracking-widest">Reference (Optional Model/Gen suffix)</span></label>
                <input type="text" className="input input-sm input-bordered w-full bg-white" placeholder="e.g. 2nd Gen, ANC Edition" value={referenceString} onChange={e => setReferenceString(e.target.value)} />
              </div>
            </div>
          </section>

          {/* Audio & Performance Ratings */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-3">
              <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shadow-lg shadow-blue-200">2</span> 
              Performance Ratings
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              {renderRatingGroup('Battery Autonomy', batteryAutonomyRate, setBatteryAutonomyRate)}
              {renderRatingGroup('Delay / Sync (Video & Gaming)', delaySyncRate, setDelaySyncRate)}
              {renderRatingGroup('Durability / Robustness', robustnessRate, setRobustnessRate)}
              {renderRatingGroup('Noise Reduction Quality', noiseReductionRate, setNoiseReductionRate)}
              {renderRatingGroup('Sound Quality (Music)', soundQualityMusic, setSoundQualityMusic)}
              {renderRatingGroup('Sound Quality (Video/Movies)', soundQualityVideo, setSoundQualityVideo)}
              {renderRatingGroup('Sound Quality (Podcasts/Interviews)', soundQualityPodcasts, setSoundQualityPodcasts)}
            </div>
          </section>

          {/* Use Cases */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-3">
              <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shadow-lg shadow-blue-200">3</span> 
              Music Styles & Context
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text font-bold text-gray-600">Style you listen to the MOST</span></label>
                <select className="select select-bordered w-full bg-white font-medium" value={musicStyleMostListened} onChange={e => setMusicStyleMostListened(e.target.value)}>
                  <option value="">Select style</option>
                  {MUSIC_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label"><span className="label-text font-bold text-gray-600">Style the earbuds are BEST SUITABLE for</span></label>
                <select className="select select-bordered w-full bg-white font-medium" value={musicStyleMostSuitable} onChange={e => setMusicStyleMostSuitable(e.target.value)}>
                  <option value="">Select style</option>
                  {MUSIC_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Localization Anti-Loss Features */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-3">
              <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shadow-lg shadow-blue-200">4</span> 
              Localization (Anti-Loss)
            </h2>
            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 bg-white rounded-2xl border border-orange-200/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-primary" checked={hasEarbudLocalization} onChange={e => setHasEarbudLocalization(e.target.checked)} />
                  <span className="font-bold text-gray-800">Has Earbud Localization</span>
                </label>
                {hasEarbudLocalization && (
                  <div className="flex items-center gap-2 border-l pl-4">
                    <span className="text-sm font-bold text-gray-500">Rating:</span>
                    <select className="select select-sm select-bordered w-24" value={earbudLocRate} onChange={e => setEarbudLocRate(Number(e.target.value))}>
                      <option value="">N/A</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}/5</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 bg-white rounded-2xl border border-orange-200/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-primary" checked={hasCaseLocalization} onChange={e => setHasCaseLocalization(e.target.checked)} />
                  <span className="font-bold text-gray-800">Has Case Localization</span>
                </label>
                {hasCaseLocalization && (
                  <div className="flex items-center gap-2 border-l pl-4">
                    <span className="text-sm font-bold text-gray-500">Rating:</span>
                    <select className="select select-sm select-bordered w-24" value={caseLocRate} onChange={e => setCaseLocRate(Number(e.target.value))}>
                      <option value="">N/A</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}/5</option>)}
                    </select>
                  </div>
                )}
              </div>

              {(hasEarbudLocalization || hasCaseLocalization) && (
                <div className="p-6 bg-orange-100/30 rounded-3xl mt-4 space-y-6 border border-orange-200">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Feature capabilities</label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-orange-100 cursor-pointer text-sm font-bold text-gray-700">
                        <input type="radio" className="radio radio-primary radio-sm" checked={localizationType === 'MAP'} onChange={() => setLocalizationType('MAP')} /> Map based
                      </label>
                      <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-orange-100 cursor-pointer text-sm font-bold text-gray-700">
                        <input type="radio" className="radio radio-primary radio-sm" checked={localizationType === 'SOUND'} onChange={() => setLocalizationType('SOUND')} /> Sound Emitting
                      </label>
                      <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-orange-100 cursor-pointer text-sm font-bold text-gray-700">
                        <input type="radio" className="radio radio-primary radio-sm" checked={localizationType === 'BOTH'} onChange={() => setLocalizationType('BOTH')} /> Both
                      </label>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer bg-white/50 p-3 rounded-xl">
                      <input type="checkbox" className="checkbox checkbox-success" checked={localizationSavedLife} onChange={e => setLocalizationSavedLife(e.target.checked)} />
                      <span className="font-bold text-orange-900 text-sm italic">Did this tracking feature save you from having to buy a new one?</span>
                    </label>
                  </div>
                </div>
              )}
              
            </div>
          </section>

          {/* Details & Ownership */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-3">
              <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shadow-lg shadow-blue-200">5</span> 
              Ownership & Purchase
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
               <div>
                <label className="label"><span className="label-text font-bold text-gray-600">Purchase Date</span></label>
                <input type="date" className="input input-bordered w-full bg-white font-medium" value={dateOfPurchase} onChange={e => setDateOfPurchase(e.target.value)} />
              </div>
              <div>
                <label className="label"><span className="label-text font-bold text-gray-600">Months Used</span></label>
                <input type="number" className="input input-bordered w-full bg-white font-medium" min={1} placeholder="e.g. 12" value={usageDurationMonths} onChange={e => setUsageDurationMonths(Number(e.target.value))} />
              </div>
              <div>
                <label className="label"><span className="label-text font-bold text-gray-600">Price Paid</span></label>
                <input type="number" step="0.01" className="input input-bordered w-full bg-white font-medium" placeholder="Currency ($/€)" value={pricePaid} onChange={e => setPricePaid(Number(e.target.value))} />
              </div>
              
              <div className="mt-4 col-span-3 border-t pt-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Localization Geography</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="label"><span className="label-text font-bold text-gray-600 text-xs">Store / Web Name</span></label>
                    <input type="text" className="input input-bordered w-full bg-white" placeholder="e.g. Amazon, BestBuy" value={locationPurchase} onChange={e => setLocationPurchase(e.target.value)} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-bold text-gray-600 text-xs">Country of Purchase</span></label>
                    <select className="select select-bordered w-full bg-white" value={countryOfPurchase} onChange={e => setCountryOfPurchase(e.target.value)}>
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-bold text-gray-600 text-xs">Country of Usage</span></label>
                    <select className="select select-bordered w-full bg-white" value={countryOfUsage} onChange={e => setCountryOfUsage(e.target.value)}>
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Loss Scenario */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-3">
              <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shadow-lg shadow-blue-200">6</span> 
              Loss Experience
            </h2>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-6">
              
              <div>
                <label className="label"><span className="label-text font-bold text-gray-600">Share your experience with losing earbud parts</span></label>
                <textarea 
                  className="textarea textarea-bordered w-full h-32 bg-white" 
                  placeholder="Did they fall out often? How was the replacement process?" 
                  value={lossExperienceDetails} 
                  onChange={e => setLossExperienceDetails(e.target.value)} 
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-6 bg-white p-4 rounded-2xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-primary" checked={purchasedNewKit} onChange={e => setPurchasedNewKit(e.target.checked)} />
                  <span className="font-bold text-gray-700 text-sm leading-tight">I eventually purchased a completely new kit</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-primary" checked={boughtSpareItem} onChange={e => setBoughtSpareItem(e.target.checked)} />
                  <span className="font-bold text-gray-700 text-sm leading-tight">I managed to buy a spare replacement part</span>
                </label>
              </div>

              {boughtSpareItem && (
                <div className="grid md:grid-cols-2 gap-6 mt-4 p-6 bg-white rounded-3xl border border-primary/10 shadow-sm">
                  <div>
                    <label className="label"><span className="label-text text-xs font-black uppercase text-gray-400">Spare condition</span></label>
                    <select className="select select-bordered w-full font-bold" value={spareCondition} onChange={e => setSpareCondition(e.target.value)}>
                      <option value="">Select condition...</option>
                      <option value="NEW">Brand New</option>
                      <option value="USED">Used / Refurbished</option>
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text text-xs font-black uppercase text-gray-400">Where was the spare sourced?</span></label>
                    <input type="text" className="input input-bordered w-full font-bold" placeholder="e.g. Marketplace, Friend, Maker" value={sparePurchaseLocation} onChange={e => setSparePurchaseLocation(e.target.value)} />
                  </div>
                </div>
              )}

            </div>
          </section>

          {error && (
            <div className="alert alert-error shadow-xl rounded-2xl border-none text-white italic font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="pt-10 border-t flex justify-between items-center">
            <p className="text-xs text-gray-400 max-w-sm">By submitting, you agree that your anonymized data will be used to generate community statistics.</p>
            <button type="submit" className="btn btn-primary btn-lg rounded-2xl px-12 shadow-2xl shadow-primary/30 transform transition-all hover:scale-105 active:scale-95" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Submit Insights'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
