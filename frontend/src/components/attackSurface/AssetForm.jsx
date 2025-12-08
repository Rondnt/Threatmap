import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AssetForm = ({ asset, onSubmit, onCancel, allAssets }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'server',
    description: '',
    ip_address: '',
    hostname: '',
    os: '',
    location: '',
    criticality: 'medium',
    is_public_facing: false,
    ports_open: '',
    services: '',
    status: 'active',
    exposure_level: 'internal',
    owner: '',
    tags: '',
    notes: '',
    connections: []
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        type: asset.type || 'server',
        description: asset.description || '',
        ip_address: asset.ip_address || '',
        hostname: asset.hostname || '',
        os: asset.os || '',
        location: asset.location || '',
        criticality: asset.criticality || 'medium',
        is_public_facing: asset.is_public_facing === true,
        ports_open: Array.isArray(asset.ports_open) ? asset.ports_open.join(',') : '',
        services: Array.isArray(asset.services) ? asset.services.join(',') : '',
        status: asset.status || 'active',
        exposure_level: asset.exposure_level || 'internal',
        owner: asset.owner || '',
        tags: Array.isArray(asset.tags) ? asset.tags.join(',') : '',
        notes: asset.notes || '',
        connections: asset.connections || []
      });
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConnectionsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      connections: selectedOptions
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    // Parse comma-separated values
    const dataToSubmit = {
      ...formData,
      ports_open: formData.ports_open
        ? formData.ports_open.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p))
        : [],
      services: formData.services
        ? formData.services.split(',').map(s => s.trim()).filter(s => s)
        : [],
      tags: formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
        : []
    };

    onSubmit(dataToSubmit);
  };

  const assetTypes = [
    { value: 'server', label: 'Server' },
    { value: 'workstation', label: 'Workstation' },
    { value: 'network_device', label: 'Network Device' },
    { value: 'database', label: 'Database' },
    { value: 'application', label: 'Application' },
    { value: 'cloud_service', label: 'Cloud Service' },
    { value: 'mobile_device', label: 'Mobile Device' },
    { value: 'iot_device', label: 'IoT Device' },
    { value: 'api', label: 'API' },
    { value: 'web_service', label: 'Web Service' },
    { value: 'firewall', label: 'Firewall' },
    { value: 'load_balancer', label: 'Load Balancer' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Asset *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            {assetTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección IP
          </label>
          <input
            type="text"
            name="ip_address"
            value={formData.ip_address}
            onChange={handleChange}
            placeholder="192.168.1.100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hostname
          </label>
          <input
            type="text"
            name="hostname"
            value={formData.hostname}
            onChange={handleChange}
            placeholder="web-server-01.domain.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sistema Operativo
          </label>
          <input
            type="text"
            name="os"
            value={formData.os}
            onChange={handleChange}
            placeholder="Ubuntu 22.04, Windows Server 2019"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="AWS us-east-1, Data Center A"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Criticidad *
          </label>
          <select
            name="criticality"
            value={formData.criticality}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel de Exposición *
          </label>
          <select
            name="exposure_level"
            value={formData.exposure_level}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="public">Public</option>
            <option value="dmz">DMZ</option>
            <option value="internal">Internal</option>
            <option value="isolated">Isolated</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Puertos Abiertos
          </label>
          <input
            type="text"
            name="ports_open"
            value={formData.ports_open}
            onChange={handleChange}
            placeholder="80,443,22"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">Separar con comas</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Servicios
          </label>
          <input
            type="text"
            name="services"
            value={formData.services}
            onChange={handleChange}
            placeholder="HTTP,HTTPS,SSH"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">Separar con comas</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsable/Equipo
          </label>
          <input
            type="text"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            placeholder="DevOps Team, Security Team"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="decommissioned">Decommissioned</option>
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="is_public_facing"
            checked={formData.is_public_facing}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            Expuesto Públicamente (Public Facing)
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Etiquetas
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="producción,crítico,web"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">Separar con comas</p>
      </div>

      {allAssets && allAssets.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conexiones con otros Assets
          </label>
          <select
            multiple
            value={formData.connections}
            onChange={handleConnectionsChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            size="5"
          >
            {allAssets
              .filter(a => !asset || a.id !== asset.id)
              .map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Mantén presionado Ctrl/Cmd para seleccionar múltiples
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas Adicionales
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {asset ? 'Actualizar Asset' : 'Crear Asset'}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
