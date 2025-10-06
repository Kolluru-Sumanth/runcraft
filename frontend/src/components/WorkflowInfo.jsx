import React from "react";

function WorkflowInfo({ workflow, isMobile = false }) {
  if (!workflow) {
    return (
      <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
        <h3 className={`font-medium text-gray-700 mb-3 ${isMobile ? 'text-sm' : 'text-base'}`}>
          Workflow Information
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-gray-400 mb-2">
            <svg 
              className={`mx-auto ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Upload a workflow to see details
          </p>
        </div>
      </div>
    );
  }

  const nodes = workflow.nodes || [];
  const connections = workflow.connections || {};
  const name = workflow.name || "Untitled Workflow";
  const description = workflow.description || "No description provided";

  // Analyze workflow complexity
  const nodeCount = nodes.length;
  const connectionCount = Object.keys(connections).length;
  const nodeTypes = [...new Set(nodes.map(node => node.type))];

  // Get workflow statistics
  const getComplexityLevel = () => {
    if (nodeCount <= 3) return { level: "Simple", color: "text-green-600 bg-green-50", icon: "🟢" };
    if (nodeCount <= 8) return { level: "Medium", color: "text-yellow-600 bg-yellow-50", icon: "🟡" };
    return { level: "Complex", color: "text-red-600 bg-red-50", icon: "🔴" };
  };

  const complexity = getComplexityLevel();

  return (
    <div className={`${isMobile ? 'mb-4' : 'mb-6'} overflow-hidden`}>
      <h3 className={`font-medium text-gray-700 mb-3 ${isMobile ? 'text-sm' : 'text-base'}`}>
        Workflow Information
      </h3>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Workflow Header */}
        <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 ${isMobile ? 'p-3' : 'p-4'} border-b border-gray-200`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-gray-900 truncate ${isMobile ? 'text-sm' : 'text-base'}`} title={name}>
                {name}
              </h4>
              {description && (
                <p className={`text-gray-600 mt-1 line-clamp-2 ${isMobile ? 'text-xs' : 'text-sm'}`} title={description}>
                  {description}
                </p>
              )}
            </div>
            <div className={`ml-2 flex-shrink-0 ${complexity.color} px-2 py-1 rounded-full text-xs font-medium`}>
              <span className="mr-1">{complexity.icon}</span>
              {complexity.level}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 gap-1 ${isMobile ? 'p-3' : 'p-4'}`}>
          <StatCard 
            label="Nodes" 
            value={nodeCount} 
            icon="⚙️" 
            isMobile={isMobile}
          />
          <StatCard 
            label="Connections" 
            value={connectionCount} 
            icon="🔗" 
            isMobile={isMobile}
          />
        </div>

        {/* Node Types */}
        {nodeTypes.length > 0 && (
          <div className={`border-t border-gray-100 ${isMobile ? 'p-3' : 'p-4'}`}>
            <h5 className={`font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Node Types ({nodeTypes.length})
            </h5>
            <div className="flex flex-wrap gap-1">
              {nodeTypes.slice(0, isMobile ? 4 : 6).map((type, index) => (
                <span 
                  key={index}
                  className={`
                    inline-flex items-center px-2 py-1 rounded-full 
                    bg-gray-100 text-gray-700 font-medium
                    ${isMobile ? 'text-xs' : 'text-xs'}
                  `}
                  title={type}
                >
                  {type.length > (isMobile ? 8 : 12) ? `${type.substring(0, isMobile ? 8 : 12)}...` : type}
                </span>
              ))}
              {nodeTypes.length > (isMobile ? 4 : 6) && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  +{nodeTypes.length - (isMobile ? 4 : 6)} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Additional Info for larger screens */}
        {!isMobile && workflow.createdAt && (
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Created: {new Date(workflow.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, isMobile }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className={`${isMobile ? 'text-lg' : 'text-xl'} mb-1`}>{icon}</div>
      <div className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
        {value}
      </div>
      <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>
        {label}
      </div>
    </div>
  );
}

export default WorkflowInfo;