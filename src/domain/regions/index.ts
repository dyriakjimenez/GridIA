export interface Region {
  estados: string[];
  nota: string;
}

export interface CountryDef {
  emoji: string;
  regions: {
    norte: Region;
    centro: Region;
    sur: Region;
    [key: string]: Region;
  };
}

export const REGION_KEYS = ['norte', 'centro', 'sur'];
export const REGION_LABEL: Record<string, string> = { norte: 'Norte', centro: 'Centro', sur: 'Sur', general: 'General', lid: 'LID Marketing' };

export const COUNTRIES: Record<string, CountryDef> = {
  'México': {
    emoji: '🇲🇽',
    regions: {
      norte: {
        estados: ['Baja California', 'Baja California Sur', 'Sonora', 'Chihuahua', 'Coahuila', 'Nuevo León', 'Tamaulipas', 'Sinaloa', 'Durango'],
        nota: 'Español norteño: directo, práctico y desenfadado. Modismos como "qué onda", "ándale", "órale", "compa", "carnal", "a todo dar", "plebada/plebes", "morros", "bien chido", anglicismos fronterizos ("troca", "lonche", "parquear", "wachar"). Tono aspiracional, trabajador y de rendimiento.',
      },
      centro: {
        estados: ['Aguascalientes', 'Zacatecas', 'San Luis Potosí', 'Nayarit', 'Jalisco', 'Colima', 'Guanajuato', 'Querétaro', 'Hidalgo', 'Michoacán', 'Estado de México', 'Ciudad de México', 'Morelos', 'Tlaxcala', 'Puebla'],
        nota: 'Español del centro (chilango/bajío): "chido", "padrísimo", "no manches", "qué pex", "híjole", "ahorita", "un chorro", "neta", "cámara", "chamba", "chela". Tono urbano, dinámico, con humor y doble sentido, muy trendy y digital.',
      },
      sur: {
        estados: ['Guerrero', 'Oaxaca', 'Chiapas', 'Veracruz', 'Tabasco', 'Campeche', 'Yucatán', 'Quintana Roo'],
        nota: 'Español del sur y sureste: cálido, hospitalario y pausado. Regionalismos costeños/mayas: "está cañón", "chilo", en Yucatán muletillas mayas ("¿va?", "papitas", "lo/loch"), tono jarocho/tabasqueño relajado ("¿qué pasó, mi rey?", "chamaco"). Tono comunitario, familiar y de arraigo.',
      },
    },
  },
  'Colombia': {
    emoji: '🇨🇴',
    regions: {
      norte: { estados: ['Atlántico (Barranquilla)', 'Bolívar (Cartagena)', 'Magdalena', 'La Guajira', 'Cesar', 'Córdoba', 'Sucre', 'San Andrés y Providencia'], nota: 'Costeño/Caribe: cálido y alegre. "ajá", "eche", "no joda", "bacano", "mani", "erda", ritmo y humor, cadencia caribeña.' },
      centro: { estados: ['Cundinamarca (Bogotá)', 'Antioquia (Medellín)', 'Santander', 'Norte de Santander', 'Boyacá', 'Caldas', 'Risaralda', 'Quindío', 'Tolima', 'Huila'], nota: 'Andino (paisa/rolo/santandereano): "parce", "bacano", "chévere", "qué más pues", "berraco", "hágale", trato cordial y de "usted".' },
      sur: { estados: ['Valle del Cauca (Cali)', 'Cauca', 'Nariño', 'Putumayo', 'Caquetá', 'Amazonas', 'Meta', 'Casanare', 'Chocó'], nota: 'Sur/Pacífico/valluno: "ve", "mirá ve", "oís", "chévere", "bacano", sabor pacífico, caleño y llanero.' },
    },
  },
  'Argentina': {
    emoji: '🇦🇷',
    regions: {
      norte: { estados: ['Jujuy', 'Salta', 'Tucumán', 'Catamarca', 'Santiago del Estero', 'La Rioja', 'Formosa', 'Chaco', 'Misiones', 'Corrientes'], nota: 'Norteño (NOA/NEA): tonada cantada, "che", "chango", "pibe", calidez provinciana, guaranismos en el litoral.' },
      centro: { estados: ['Córdoba', 'Santa Fe', 'Entre Ríos', 'Buenos Aires', 'Ciudad de Buenos Aires', 'La Pampa', 'San Luis', 'Mendoza', 'San Juan'], nota: 'Rioplatense/cordobés: voseo, "che", "copado", "quilombo", "posta", tonada cordobesa, humor urbano.' },
      sur: { estados: ['Neuquén', 'Río Negro', 'Chubut', 'Santa Cruz', 'Tierra del Fuego'], nota: 'Patagónico: sobrio, "che", modismos sureños, identidad de paisaje, viento y aventura.' },
    },
  },
  'Perú': {
    emoji: '🇵🇪',
    regions: {
      norte: { estados: ['Tumbes', 'Piura', 'Lambayeque', 'La Libertad (Trujillo)', 'Cajamarca', 'Amazonas', 'San Martín'], nota: 'Norteño costeño: cálido, "causa", "pata", "bacán", "de hechera", sabor chiclayano/piurano.' },
      centro: { estados: ['Lima', 'Callao', 'Áncash', 'Huánuco', 'Pasco', 'Junín', 'Huancavelica', 'Ica', 'Ucayali'], nota: 'Limeño/central: "pe", "jerga", "chévere", "bacán", "al toque", "habla", urbano y directo.' },
      sur: { estados: ['Ayacucho', 'Apurímac', 'Cusco', 'Arequipa', 'Moquegua', 'Tacna', 'Puno', 'Madre de Dios'], nota: 'Sureño/andino: orgullo cusqueño y "characato" arequipeño, quechuismos, tono regionalista.' },
    },
  },
  'Chile': {
    emoji: '🇨🇱',
    regions: {
      norte: { estados: ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo'], nota: 'Norte: "cachái", "al tiro", identidad minera y costera, tono sobrio y trabajador.' },
      centro: { estados: ['Valparaíso', 'Metropolitana (Santiago)', "O'Higgins", 'Maule', 'Ñuble', 'Biobío'], nota: 'Central/santiaguino: "cachái", "bacán", "la raja", "al tiro", "pololo", jerga rápida y urbana.' },
      sur: { estados: ['La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'], nota: 'Sur: "po", calidez sureña, mapuchismos, identidad de lluvia, campo y naturaleza.' },
    },
  },
  'Ecuador': {
    emoji: '🇪🇨',
    regions: {
      norte: { estados: ['Carchi', 'Imbabura', 'Esmeraldas', 'Sucumbíos', 'Pichincha (Quito)', 'Napo', 'Orellana'], nota: 'Sierra norte/Quito: serrano cordial, "ñaño", "chévere", "chuta", "de una", quichuismos.' },
      centro: { estados: ['Cotopaxi', 'Tungurahua', 'Chimborazo', 'Bolívar', 'Pastaza', 'Manabí', 'Los Ríos', 'Santo Domingo'], nota: 'Centro/Manabí: montubio y serrano, "mijín", "verás", "chuzo", cadencia costeña-serrana.' },
      sur: { estados: ['Azuay (Cuenca)', 'Cañar', 'Loja', 'El Oro', 'Guayas (Guayaquil)', 'Santa Elena', 'Zamora Chinchipe', 'Morona Santiago', 'Galápagos'], nota: 'Sur/Guayaquil: costeño "ma", "pana", "bacán", "de ley", "full", humor guayaco.' },
    },
  },
  'España': {
    emoji: '🇪🇸',
    regions: {
      norte: { estados: ['Galicia', 'Asturias', 'Cantabria', 'País Vasco', 'Navarra', 'La Rioja', 'Aragón', 'Cataluña'], nota: 'Norte: sobrio, "majo", orgullo verde y gastronómico, catalanismos/vasquismos puntuales.' },
      centro: { estados: ['Madrid', 'Castilla y León', 'Castilla-La Mancha', 'Extremadura'], nota: 'Centro/Madrid: "majo", "guay", "flipar", "currar", castizo y directo.' },
      sur: { estados: ['Andalucía', 'Región de Murcia', 'Comunidad Valenciana', 'Islas Baleares', 'Canarias'], nota: 'Sur/andaluz-levante: salero, "quillo", "illo", "ea", "chacho", humor y arte.' },
    },
  },
  'Venezuela': {
    emoji: '🇻🇪',
    regions: {
      norte: { estados: ['Distrito Capital (Caracas)', 'Miranda', 'La Guaira', 'Aragua', 'Carabobo', 'Falcón', 'Nueva Esparta', 'Yaracuy', 'Lara'], nota: 'Central/costero: "chamo", "pana", "chévere", "burda", "na guará" (Lara), caraqueño rápido.' },
      centro: { estados: ['Zulia (Maracaibo)', 'Trujillo', 'Mérida', 'Táchira', 'Barinas', 'Portuguesa', 'Cojedes', 'Guárico'], nota: 'Andino/zuliano: gocho cordial y maracucho fuerte ("mollejúo", "vale"), calidez andina.' },
      sur: { estados: ['Apure', 'Anzoátegui', 'Monagas', 'Sucre', 'Bolívar', 'Amazonas', 'Delta Amacuro'], nota: 'Oriente/Guayana: "muchacho", "compái", "vale", sabor oriental y cadencia caribeña.' },
    },
  },
  'Guatemala': {
    emoji: '🇬🇹',
    regions: {
      norte: { estados: ['Petén', 'Alta Verapaz', 'Baja Verapaz', 'Izabal', 'Quiché'], nota: 'Norte/Verapaces: cálido, voces k\u2019iche\u2019/mayas, "vos", "cabal".' },
      centro: { estados: ['Guatemala', 'Sacatepéquez', 'Chimaltenango', 'El Progreso', 'Jalapa', 'Zacapa', 'Chiquimula', 'Santa Rosa'], nota: 'Centro/capital: chapín urbano, "vos", "cabal", "chilero", "shute", cordial.' },
      sur: { estados: ['Escuintla', 'Suchitepéquez', 'Retalhuleu', 'Quetzaltenango', 'Totonicapán', 'Sololá', 'San Marcos', 'Huehuetenango', 'Jutiapa'], nota: 'Occidente/sur: "vos", "patojo", voces mayas (k\u2019iche\u2019/mam), sabor de boca costa.' },
    },
  },
  'República Dominicana': {
    emoji: '🇩🇴',
    regions: {
      norte: { estados: ['Santiago', 'Puerto Plata', 'La Vega', 'Espaillat', 'Duarte', 'Valverde', 'Samaná', 'Montecristi', 'Dajabón', 'Sánchez Ramírez'], nota: 'Cibao: cantado, "manín", "qué lo que", "vaina", "tíguere", calidez cibaeña.' },
      centro: { estados: ['Distrito Nacional (Santo Domingo)', 'Santo Domingo', 'Monte Plata', 'San Cristóbal', 'La Altagracia', 'La Romana', 'San Pedro de Macorís', 'Hato Mayor'], nota: 'Capital/este: dominicano urbano, "dígalo", "qué lo que", "jevi", dembow y flow.' },
      sur: { estados: ['Peravia', 'Azua', 'San José de Ocoa', 'Barahona', 'Bahoruco', 'Independencia', 'Pedernales', 'San Juan', 'Elías Piña'], nota: 'Sur: "compái", sabor sureño, campo y merengue típico.' },
    },
  },
};

export const allStatesOf = (c: string): Record<string, string[]> => {
  if (!COUNTRIES[c]) return { norte: [], centro: [], sur: [] };
  return {
    norte: [...COUNTRIES[c].regions.norte.estados],
    centro: [...COUNTRIES[c].regions.centro.estados],
    sur: [...COUNTRIES[c].regions.sur.estados],
  };
};
