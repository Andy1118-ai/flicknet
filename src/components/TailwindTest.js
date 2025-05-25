import React from 'react';
import { FaCheck, FaPalette, FaCode, FaMobile } from 'react-icons/fa';

const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Tailwind CSS Successfully Installed!
          </h1>
          <p className="text-xl text-gray-600">
            Your FlickNet application is now powered by Tailwind CSS
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card-hover p-6 text-center">
            <FaCheck className="text-3xl text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Installed</h3>
            <p className="text-gray-600">Tailwind CSS v3.4 is ready to use</p>
          </div>

          <div className="card-hover p-6 text-center">
            <FaPalette className="text-3xl text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Blue Theme</h3>
            <p className="text-gray-600">Custom blue color palette configured</p>
          </div>

          <div className="card-hover p-6 text-center">
            <FaCode className="text-3xl text-secondary-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Components</h3>
            <p className="text-gray-600">Pre-built component classes available</p>
          </div>

          <div className="card-hover p-6 text-center">
            <FaMobile className="text-3xl text-accent-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsive</h3>
            <p className="text-gray-600">Mobile-first responsive design</p>
          </div>
        </div>

        {/* Button Examples */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Examples</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-outline">Outline Button</button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Success Button
            </button>
          </div>
        </div>

        {/* Form Example */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Elements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Field
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter some text..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Field
              </label>
              <select className="input-field">
                <option>Choose an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Color Palette</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Colors</h3>
            <div className="flex flex-wrap gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                <div key={shade} className="text-center">
                  <div className={`w-12 h-12 rounded-lg bg-primary-${shade} border border-gray-200`}></div>
                  <span className="text-xs text-gray-600 mt-1 block">{shade}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Secondary Colors</h3>
            <div className="flex flex-wrap gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                <div key={shade} className="text-center">
                  <div className={`w-12 h-12 rounded-lg bg-secondary-${shade} border border-gray-200`}></div>
                  <span className="text-xs text-gray-600 mt-1 block">{shade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            🚀 Ready to build amazing UIs with Tailwind CSS!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
