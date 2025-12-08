import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const NetworkTopology = ({ data, onNodeClick, onNodeDrag }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create container for zoom
    const g = svg.append('g');

    // Define zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Color scales based on criticality and exposure
    const criticalityColor = d3.scaleOrdinal()
      .domain(['critical', 'high', 'medium', 'low'])
      .range(['#dc2626', '#ea580c', '#f59e0b', '#84cc16']);

    const exposureColor = d3.scaleOrdinal()
      .domain(['public', 'dmz', 'internal', 'isolated'])
      .range(['#dc2626', '#f97316', '#3b82f6', '#6b7280']);

    // Node size based on vulnerabilities count
    const nodeSize = d3.scaleLinear()
      .domain([0, d3.max(data.nodes, d => d.vulnerabilities_count || 0)])
      .range([20, 50]);

    // Create arrow markers for directed links
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links)
        .id(d => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody()
        .strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => nodeSize(d.vulnerabilities_count || 0) + 10));

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    // Create node groups
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    const circles = node.append('circle')
      .attr('r', 0) // Start from 0 for animation
      .attr('fill', d => {
        // Si está expuesto públicamente, usar color más claro para que se vea el borde
        if (d.is_public_facing) {
          const baseColor = criticalityColor(d.criticality);
          return d3.color(baseColor).brighter(1.5);
        }
        return criticalityColor(d.criticality);
      })
      .attr('stroke', d => d.is_public_facing ? criticalityColor(d.criticality) : '#fff')
      .attr('stroke-width', d => d.is_public_facing ? 5 : 2)
      .attr('stroke-dasharray', d => (d.status === 'inactive' || d.status === 'Inactive') ? '5,5' : 'none')
      .attr('opacity', 0)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', nodeSize(d.vulnerabilities_count || 0) + 5)
          .attr('opacity', 1);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', nodeSize(d.vulnerabilities_count || 0))
          .attr('opacity', (d.status === 'inactive' || d.status === 'Inactive') ? 0.4 : 0.9);
      });

    // Animate entrance
    circles
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr('r', d => nodeSize(d.vulnerabilities_count || 0))
      .attr('opacity', d => (d.status === 'inactive' || d.status === 'Inactive') ? 0.4 : 0.9);

    // Add vulnerability count badge
    node.filter(d => (d.vulnerabilities_count || 0) > 0)
      .append('circle')
      .attr('class', 'vulnerability-badge')
      .attr('r', 12)
      .attr('cx', d => nodeSize(d.vulnerabilities_count || 0) * 0.5)
      .attr('cy', d => -nodeSize(d.vulnerabilities_count || 0) * 0.5)
      .attr('fill', '#ef4444')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.filter(d => (d.vulnerabilities_count || 0) > 0)
      .append('text')
      .attr('class', 'vulnerability-count')
      .attr('x', d => nodeSize(d.vulnerabilities_count || 0) * 0.5)
      .attr('y', d => -nodeSize(d.vulnerabilities_count || 0) * 0.5)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text(d => d.vulnerabilities_count);

    // Add icons based on asset type
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', d => {
        // Si está expuesto públicamente y es de criticidad baja/media, usar texto oscuro
        if (d.is_public_facing && (d.criticality === 'low' || d.criticality === 'medium')) {
          return '#1f2937';
        }
        return '#fff';
      })
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text(d => getAssetIcon(d.type));

    // Add labels
    node.append('text')
      .attr('dy', d => nodeSize(d.vulnerabilities_count || 0) + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1f2937')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .attr('opacity', d => (d.status === 'inactive' || d.status === 'Inactive') ? 0.5 : 1)
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);

    // Add IP address label
    node.filter(d => d.ip_address)
      .append('text')
      .attr('dy', d => nodeSize(d.vulnerabilities_count || 0) + 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '10px')
      .attr('pointer-events', 'none')
      .attr('opacity', d => (d.status === 'inactive' || d.status === 'Inactive') ? 0.5 : 1)
      .text(d => d.ip_address);

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', '#fff')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    node.on('mouseenter', (event, d) => {
      const statusText = {
        active: 'Activo',
        inactive: 'Inactivo',
        maintenance: 'Mantenimiento',
        decommissioned: 'Dado de Baja'
      }[d.status] || d.status;

      const exposureText = {
        public: 'Público',
        dmz: 'DMZ',
        internal: 'Interno',
        isolated: 'Aislado'
      }[d.exposure_level] || d.exposure_level;

      const criticalityColor = {
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#f59e0b',
        low: '#84cc16'
      }[d.criticality] || '#6b7280';

      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="min-width: 200px;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 2px solid ${criticalityColor}; padding-bottom: 4px;">
              ${d.name}
            </div>
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="margin-bottom: 4px;"><strong>Tipo:</strong> ${d.type}</div>
              <div style="margin-bottom: 4px;">
                <strong>Criticidad:</strong>
                <span style="color: ${criticalityColor}; font-weight: bold;">${d.criticality.toUpperCase()}</span>
              </div>
              <div style="margin-bottom: 4px;"><strong>Exposición:</strong> ${exposureText}</div>
              <div style="margin-bottom: 4px;"><strong>Estado:</strong> ${statusText}</div>
              ${d.ip_address ? `<div style="margin-bottom: 4px;"><strong>IP:</strong> ${d.ip_address}</div>` : ''}
              ${d.is_public_facing ? '<div style="margin-bottom: 4px; color: #ef4444;"><strong>⚠ Expuesto Públicamente</strong></div>' : ''}
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
                <div style="display: flex; justify-content: space-between;">
                  <span><strong>Vulnerabilidades:</strong></span>
                  <span style="color: ${(d.vulnerabilities_count || 0) > 0 ? '#ef4444' : '#84cc16'}; font-weight: bold;">
                    ${d.vulnerabilities_count || 0}
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span><strong>Amenazas:</strong></span>
                  <span style="color: ${(d.threats_count || 0) > 0 ? '#f59e0b' : '#84cc16'}; font-weight: bold;">
                    ${d.threats_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        `);
    })
    .on('mousemove', (event) => {
      tooltip
        .style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    })
    .on('mouseleave', () => {
      tooltip.style('visibility', 'hidden');
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);

      // Save position if callback provided
      if (onNodeDrag) {
        onNodeDrag(d.id, { position_x: d.x, position_y: d.y });
      }

      // Keep node fixed after drag
      // Uncomment to allow nodes to float again
      // d.fx = null;
      // d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
      tooltip.remove();
    };

  }, [data, dimensions, onNodeClick, onNodeDrag]);

  const getAssetIcon = (type) => {
    const icons = {
      server: 'S',
      workstation: 'W',
      network_device: 'N',
      database: 'D',
      application: 'A',
      cloud_service: 'C',
      mobile_device: 'M',
      iot_device: 'I',
      api: 'API',
      web_service: 'WS',
      firewall: 'F',
      load_balancer: 'LB',
      other: 'O'
    };
    return icons[type] || 'O';
  };

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <svg ref={svgRef} id="network-topology-svg" className="w-full h-full"></svg>
    </div>
  );
};

export default NetworkTopology;
