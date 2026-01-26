import { useState, useEffect } from 'react';
import securityService from '../services/securityService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const SecurityDocs = () => {
  const [activeTab, setActiveTab] = useState('verification');
  const [verification, setVerification] = useState(null);
  const [securityLevels, setSecurityLevels] = useState(null);
  const [attacks, setAttacks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [verifyData, levelsData, attacksData] = await Promise.all([
        securityService.getSecurityVerification(),
        securityService.getSecurityLevelsRisks(),
        securityService.getPossibleAttacks(),
      ]);
      setVerification(verifyData);
      setSecurityLevels(levelsData);
      setAttacks(attacksData);
    } catch (err) {
      setError('Failed to load security documentation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading security documentation..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📚 Security Documentation</h1>
          <p className="text-gray-600 mt-2">Comprehensive security implementation details and theory</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'verification'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              ✅ Verification
            </button>
            <button
              onClick={() => setActiveTab('levels')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'levels'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📊 Security Levels & Risks
            </button>
            <button
              onClick={() => setActiveTab('attacks')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'attacks'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              ⚔️ Possible Attacks
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'verification' && verification && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Lab Evaluation Verification</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-2xl font-bold text-green-800">{verification.lab_evaluation_status}</p>
                  <p className="text-lg text-gray-700 mt-2">Total Marks: {verification.total_marks}</p>
                </div>
              </div>

              {Object.entries(verification.components || {}).map(([key, component]) => (
                <div key={key} className="border-2 border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h3>
                    <span className="text-3xl">{component.status}</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-600 mb-3">Marks: {component.marks}</p>
                  {component.features && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                      {Array.isArray(component.features) ? (
                        <ul className="space-y-1">
                          {component.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(component.features).map(([fKey, fValue]) => (
                            <div key={fKey} className="bg-gray-50 rounded p-3">
                              <h5 className="font-semibold text-gray-900 capitalize mb-1">
                                {fKey.replace(/_/g, ' ')}
                              </h5>
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(fValue, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {component.test_endpoints && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Test Endpoints:</h4>
                      <ul className="space-y-1">
                        {component.test_endpoints.map((endpoint, idx) => (
                          <li key={idx} className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                            {endpoint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'levels' && securityLevels && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Levels & Risks Theory</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-xl font-bold text-blue-900">{securityLevels.status}</p>
                  <p className="text-lg text-gray-700 mt-2">Marks: {securityLevels.marks}</p>
                </div>
              </div>

              {securityLevels.security_levels && Object.entries(securityLevels.security_levels).map(([key, level]) => (
                <div key={key} className="border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {level.level}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Strength Rating:</h4>
                      <span className="text-lg font-bold text-green-600">{level.strength_rating}</span>
                    </div>
                    {level.compliance && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Compliance:</h4>
                        <span className="text-sm text-gray-700">{level.compliance}</span>
                      </div>
                    )}
                  </div>

                  {level.components_used && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Components Used:</h4>
                      <ul className="space-y-1">
                        {level.components_used.map((component, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-gray-700">{component}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {level.risks && (
                    <div>
                      <h4 className="font-semibold text-red-900 mb-3">Associated Risks:</h4>
                      <div className="space-y-3">
                        {Object.entries(level.risks).map(([rKey, risk]) => (
                          <div key={rKey} className="bg-red-50 border border-red-200 rounded p-3">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-semibold text-red-900 capitalize">{rKey.replace(/_/g, ' ')}</h5>
                              <span className={`text-xs px-2 py-1 rounded ${
                                risk.severity === 'CRITICAL' || risk.severity === 'HIGH' ? 'bg-red-200 text-red-900' :
                                risk.severity === 'MEDIUM' ? 'bg-yellow-200 text-yellow-900' :
                                'bg-green-200 text-green-900'
                              }`}>
                                {risk.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                            <p className="text-sm text-gray-600">
                              <strong>Mitigation:</strong> {risk.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {securityLevels.risk_summary && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(securityLevels.risk_summary).map(([key, value]) => (
                      <div key={key} className="bg-white rounded p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{value}</p>
                        <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attacks' && attacks && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Possible Attacks Theory</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-xl font-bold text-red-900">{attacks.status}</p>
                  <p className="text-lg text-gray-700 mt-2">Marks: {attacks.marks}</p>
                </div>
              </div>

              {attacks.attack_categories && Object.entries(attacks.attack_categories).map(([catKey, category]) => (
                <div key={catKey} className="border-2 border-red-200 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{category.target}</h3>
                  <div className="space-y-4">
                    {category.attacks && category.attacks.map((attack, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{attack.attack}</h4>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            attack.severity === 'CRITICAL' || attack.severity === 'HIGH' ? 'bg-red-200 text-red-900' :
                            attack.severity === 'MEDIUM' ? 'bg-yellow-200 text-yellow-900' :
                            attack.severity === 'LOW' ? 'bg-blue-200 text-blue-900' :
                            'bg-gray-200 text-gray-900'
                          }`}>
                            {attack.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{attack.description}</p>
                        {attack.owasp_category && (
                          <p className="text-xs text-blue-600 mb-2">OWASP: {attack.owasp_category}</p>
                        )}
                        {attack.attack_vector && (
                          <div className="mb-3">
                            <h5 className="text-sm font-semibold text-gray-900 mb-1">Attack Vector:</h5>
                            <p className="text-sm text-gray-600">{attack.attack_vector}</p>
                          </div>
                        )}
                        {attack.countermeasures && (
                          <div>
                            <h5 className="text-sm font-semibold text-green-900 mb-2">Countermeasures:</h5>
                            <ul className="space-y-1">
                              {attack.countermeasures.map((cm, cmIdx) => (
                                <li key={cmIdx} className="flex items-start text-sm">
                                  <span className="text-green-600 mr-2">✓</span>
                                  <span className="text-gray-700">{cm}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {attack.implementation_status && (
                          <p className="text-xs text-gray-600 mt-2">
                            <strong>Status:</strong> {attack.implementation_status}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {attacks.attack_summary && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Attack Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(attacks.attack_summary).map(([key, value]) => (
                      <div key={key} className="bg-white rounded p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">{value}</p>
                        <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDocs;
