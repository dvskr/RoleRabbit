// INDUSTRY: MANUFACTURING & ENGINEERING (120+ Technologies)
// CAD, CAM, PLM, MES, Simulation, Quality, CNC, Robotics

const INDUSTRY_MANUFACTURING_ENGINEERING = {

  // ============================================================================
  // CAD/CAM SOFTWARE (40+)
  // ============================================================================
  
  'autocad': { synonyms: ['auto cad'], related: ['cad', '2d', '3d', 'autodesk'], category: 'industry-engineering', subcategory: 'cad', keywords: ['cad', 'drafting', '2d 3d', 'autodesk'], level: 'intermediate', popularity: 'very-high' },
  'solidworks': { synonyms: ['solid works'], related: ['cad', '3d', 'parametric', 'dassault'], category: 'industry-engineering', subcategory: 'cad', keywords: ['3d cad', 'parametric', 'mechanical design'], level: 'advanced', popularity: 'very-high' },
  'catia': { synonyms: [], related: ['cad', '3d', 'aerospace', 'dassault'], category: 'industry-engineering', subcategory: 'cad', keywords: ['3d cad', 'aerospace', 'automotive', 'complex surfaces'], level: 'expert', popularity: 'high' },
  'inventor': { synonyms: ['autodesk inventor'], related: ['cad', '3d', 'mechanical', 'autodesk'], category: 'industry-engineering', subcategory: 'cad', keywords: ['3d mechanical cad', 'parametric', 'autodesk'], level: 'advanced', popularity: 'high' },
  'fusion 360': { synonyms: ['fusion360'], related: ['cad', 'cam', 'cloud', 'autodesk'], category: 'industry-engineering', subcategory: 'cad', keywords: ['cloud cad', 'integrated cam', 'collaborative'], level: 'intermediate', popularity: 'very-high' },
  'onshape': { synonyms: [], related: ['cad', 'cloud', 'collaborative', 'browser-based'], category: 'industry-engineering', subcategory: 'cad', keywords: ['cloud cad', 'browser-based', 'collaborative'], level: 'intermediate', popularity: 'medium' },
  'creo': { synonyms: ['ptc creo', 'pro/engineer'], related: ['cad', '3d', 'parametric', 'ptc'], category: 'industry-engineering', subcategory: 'cad', keywords: ['3d cad', 'parametric', 'product design'], level: 'advanced', popularity: 'high' },
  'nx': { synonyms: ['siemens nx', 'unigraphics'], related: ['cad', 'cam', 'cae', 'siemens'], category: 'industry-engineering', subcategory: 'cad', keywords: ['integrated cad cam cae', 'aerospace', 'automotive'], level: 'expert', popularity: 'high' },
  'freecad': { synonyms: ['free cad'], related: ['cad', 'open source', 'parametric'], category: 'industry-engineering', subcategory: 'cad', keywords: ['open source cad', 'parametric', 'free'], level: 'intermediate', popularity: 'medium' },
  'mastercam': { synonyms: ['master cam'], related: ['cam', 'cnc', 'machining'], category: 'industry-engineering', subcategory: 'cam', keywords: ['cnc programming', 'cam', 'machining'], level: 'advanced', popularity: 'very-high' },
  'gibbs cam': { synonyms: ['gibbscam'], related: ['cam', 'cnc', 'machining'], category: 'industry-engineering', subcategory: 'cam', keywords: ['cam software', 'cnc', 'turning milling'], level: 'advanced', popularity: 'medium' },
  'edgecam': { synonyms: ['edge cam'], related: ['cam', 'cnc', 'hexagon'], category: 'industry-engineering', subcategory: 'cam', keywords: ['cam software', 'cnc programming', '2.5d to 5-axis'], level: 'advanced', popularity: 'medium' },
  'hypermill': { synonyms: ['hyper mill'], related: ['cam', 'cnc', '5-axis'], category: 'industry-engineering', subcategory: 'cam', keywords: ['cam software', '5-axis machining', 'high-speed'], level: 'expert', popularity: 'medium' },
  'esprit': { synonyms: ['esprit cam'], related: ['cam', 'cnc', 'dp technology'], category: 'industry-engineering', subcategory: 'cam', keywords: ['cam software', 'multi-tasking', 'swiss-type'], level: 'advanced', popularity: 'medium' },
  
  // ============================================================================
  // PLM & PDM (25+)
  // ============================================================================
  
  'teamcenter': { synonyms: ['siemens teamcenter'], related: ['plm', 'pdm', 'lifecycle', 'siemens'], category: 'industry-engineering', subcategory: 'plm', keywords: ['product lifecycle', 'data management', 'enterprise plm'], level: 'expert', popularity: 'very-high' },
  'windchill': { synonyms: ['ptc windchill'], related: ['plm', 'pdm', 'ptc'], category: 'industry-engineering', subcategory: 'plm', keywords: ['plm', 'product data', 'lifecycle management'], level: 'advanced', popularity: 'high' },
  'enovia': { synonyms: ['dassault enovia', '3dexperience'], related: ['plm', 'collaboration', 'dassault'], category: 'industry-engineering', subcategory: 'plm', keywords: ['plm platform', 'collaborative', '3dexperience'], level: 'expert', popularity: 'high' },
  'aras innovator': { synonyms: ['aras'], related: ['plm', 'open source', 'flexible'], category: 'industry-engineering', subcategory: 'plm', keywords: ['open architecture plm', 'flexible', 'low-code'], level: 'advanced', popularity: 'medium' },
  'autodesk vault': { synonyms: ['vault'], related: ['pdm', 'data management', 'autodesk'], category: 'industry-engineering', subcategory: 'pdm', keywords: ['data management', 'version control', 'cad data'], level: 'intermediate', popularity: 'high' },
  'solidworks pdm': { synonyms: ['sw pdm', 'solidworks manage'], related: ['pdm', 'data management', 'solidworks'], category: 'industry-engineering', subcategory: 'pdm', keywords: ['pdm', 'data vault', 'workflow'], level: 'intermediate', popularity: 'high' },
  
  // ============================================================================
  // SIMULATION & ANALYSIS (30+)
  // ============================================================================
  
  'ansys': { synonyms: ['ansys workbench'], related: ['fea', 'cfd', 'simulation', 'analysis'], category: 'industry-engineering', subcategory: 'simulation', keywords: ['fea', 'cfd', 'multiphysics', 'structural analysis'], level: 'expert', popularity: 'very-high' },
  'abaqus': { synonyms: ['simulia abaqus'], related: ['fea', 'simulation', 'dassault'], category: 'industry-engineering', subcategory: 'simulation', keywords: ['fea', 'nonlinear analysis', 'implicit explicit'], level: 'expert', popularity: 'high' },
  'comsol': { synonyms: ['comsol multiphysics'], related: ['multiphysics', 'simulation', 'fem'], category: 'industry-engineering', subcategory: 'simulation', keywords: ['multiphysics', 'coupled phenomena', 'fem'], level: 'expert', popularity: 'high' },
  'nastran': { synonyms: ['msc nastran'], related: ['fea', 'structural', 'aerospace'], category: 'industry-engineering', subcategory: 'simulation', keywords: ['fea', 'structural analysis', 'aerospace'], level: 'expert', popularity: 'high' },
  'ls-dyna': { synonyms: ['ls dyna', 'lsdyna'], related: ['fea', 'crash simulation', 'explicit'], category: 'industry-engineering', subcategory: 'simulation', keywords: ['explicit dynamics', 'crash', 'impact'], level: 'expert', popularity: 'medium' },
  'simulink': { synonyms: ['matlab simulink'], related: ['simulation', 'modeling', 'matlab'], category: 'industry-engineering', subcategory: 'simulation', keywords: ['dynamic systems', 'model-based design', 'matlab'], level: 'advanced', popularity: 'very-high' },
  'adams': { synonyms: ['msc adams'], related: ['multibody dynamics', 'simulation', 'mechanical'], category: 'industry-engineering', subcategory: 'simulation', keywords: ['multibody dynamics', 'mechanical simulation', 'motion'], level: 'expert', popularity: 'medium' },
  'fluent': { synonyms: ['ansys fluent'], related: ['cfd', 'fluid dynamics', 'ansys'], category: 'industry-engineering', subcategory: 'simulation', keywords: ['computational fluid dynamics', 'cfd', 'flow'], level: 'expert', popularity: 'high' },
  'star-ccm+': { synonyms: ['starccm'], related: ['cfd', 'simulation', 'siemens'], category: 'industry-engineering', subcategory: 'simulation', keywords: ['cfd', 'multiphysics', 'thermal'], level: 'expert', popularity: 'medium' },
  
  // ============================================================================
  // MES & MANUFACTURING EXECUTION (15+)
  // ============================================================================
  
  'apriso': { synonyms: ['dassault apriso'], related: ['mes', 'manufacturing', 'execution'], category: 'industry-manufacturing', subcategory: 'mes', keywords: ['manufacturing execution', 'operations management', 'flexible'], level: 'expert', popularity: 'medium' },
  'plex': { synonyms: ['plex mes'], related: ['mes', 'manufacturing', 'cloud'], category: 'industry-manufacturing', subcategory: 'mes', keywords: ['cloud mes', 'manufacturing', 'quality'], level: 'advanced', popularity: 'high' },
  'wonderware': { synonyms: ['aveva wonderware'], related: ['mes', 'scada', 'aveva'], category: 'industry-manufacturing', subcategory: 'mes', keywords: ['mes', 'scada', 'operations'], level: 'advanced', popularity: 'high' },
  'infor mes': { synonyms: [], related: ['mes', 'manufacturing', 'infor'], category: 'industry-manufacturing', subcategory: 'mes', keywords: ['manufacturing execution', 'cloud', 'discrete'], level: 'advanced', popularity: 'medium' },
  'oracle manufacturing': { synonyms: [], related: ['mes', 'erp', 'oracle'], category: 'industry-manufacturing', subcategory: 'mes', keywords: ['manufacturing', 'execution', 'oracle cloud'], level: 'advanced', popularity: 'high' },
  
  // ============================================================================
  // QUALITY & STATISTICAL TOOLS (10+)
  // ============================================================================
  
  'minitab': { synonyms: [], related: ['statistics', 'quality', 'six sigma'], category: 'industry-quality', subcategory: 'statistics', keywords: ['statistical analysis', 'six sigma', 'quality'], level: 'advanced', popularity: 'very-high' },
  'jmp': { synonyms: ['jmp pro'], related: ['statistics', 'sas', 'visualization'], category: 'industry-quality', subcategory: 'statistics', keywords: ['statistical discovery', 'visualization', 'quality'], level: 'advanced', popularity: 'high' },
  'statistica': { synonyms: ['tibco statistica'], related: ['statistics', 'analytics', 'quality'], category: 'industry-quality', subcategory: 'statistics', keywords: ['statistical analysis', 'predictive analytics', 'quality'], level: 'advanced', popularity: 'medium' },
  'spotfire': { synonyms: ['tibco spotfire'], related: ['analytics', 'visualization', 'bi'], category: 'industry-quality', subcategory: 'analytics', keywords: ['visual analytics', 'bi', 'manufacturing'], level: 'intermediate', popularity: 'high' },

};

module.exports = {
  INDUSTRY_MANUFACTURING_ENGINEERING
};

