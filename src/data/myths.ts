import { CulturalMyth } from '../types';
import cantunaVideoImg from '../assets/images/cantuna_san_francisco_legend_1793734654681.jpg';
import damaTapadaVideoImg from '../assets/images/dama_tapada_guayaquil_legend_1793734670041.jpg';
import etsaVideoImg from '../assets/images/etsa_shuar_amazon_legend_1793734684486.jpg';
import excaliburVideoImg from '../assets/images/excalibur_arthur_legend_1793734697639.jpg';

export const CULTURAL_MYTHS: CulturalMyth[] = [
  // =========================================================================
  // CATEGORÍA 1: LEYENDAS (Relatos históricos, urbanos y folclóricos)
  // =========================================================================
  {
    id: 'myth-cantuna',
    category: 'leyenda',
    title: 'Cantuña y el Atrio de San Francisco',
    culturalOrigin: 'Leyenda Tradicional de Quito (Sierra Andina)',
    region: 'ecuador-sierra',
    coverImage: '🏛️⛪',
    readTimeMin: 8,
    isLockedForFree: false,
    summary:
      'La célebre hazaña de Francisco Cantuña, ilustre maestro cantero indígena, quien desafió a las fuerzas de la noche en el corazón del Quito colonial para erigir la joya arquitectónica franciscana sin entregar su alma.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: El Compromiso de Honor en las Faldas del Pichincha',
        text: 'Corría el siglo XVI en la Real Audiencia de Quito, ciudad empinada entre quebradas y coronada por las nieves del Ruco Pichincha. La orden franciscana había encomendado al maestro indígena Francisco Cantuña, respetado descendiente de guerreros y constructores incaicos, una misión titánica: la edificación del majestuoso atrio del convento de San Francisco, una explanada de piedra cóncava que debía impresionar a los siglos venideros. Cantuña empeñó su palabra, su patrimonio y su honra pública, firmando un contrato irrevocable con los frailes: la obra debía entregarse concluida hasta la última piedra al clarear el primer rayo del alba en la festividad convenida.',
        illustrationPrompt:
          'Colonial stone square of Quito at twilight, indigenous architect with architectural blueprints made of parchment looking up at unfinished monumental stone arches.',
        illustrationStyle: 'Andean Baroque woodcut & oil painting',
        glossaryTerms: [
          { word: 'Atrio', language: 'Español colonial', meaning: 'Gran explanada empedrada que antecede a un templo sagrado.', pronunciation: '[á-trio]' },
          { word: 'Rumi', language: 'Kichwa', meaning: 'Piedra viva andina, labrada con paciencia milenaria.', pronunciation: '[ru-mi]' },
          { word: 'Kallari', language: 'Kichwa', meaning: 'El génesis o punto de partida de una gran obra comunitaria.', pronunciation: '[ka-lla-ri]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: La Desesperación y el Aparecido de la Cantera',
        text: 'A medida que las semanas transcurrían, los temporales andinos y la escasez de peones ralentizaron el trabajo. Restaban apenas doce horas para que el sol iluminara la plaza y el atrio era aún un laberinto de bloques sin pulir. Cantuña se arrodilló entre las sombras de las piedras labradas. Fue en ese instante cuando la tierra vibró con un sordo quejido volcánico. Entre una niebla sulfurosa emergió una figura alta, vestida con capa escarlata y ojos ardientes como brasas: Lucifer, el señor de las sombras.',
        illustrationPrompt:
          'Fiery mist rising between massive carved granite blocks, a sinister elegant entity with glowing ember eyes appearing before an exhausted Andean stonemason.',
        illustrationStyle: 'Dramatic Andean chiaroscuro with volcanic glow',
        glossaryTerms: [
          { word: 'Supay', language: 'Kichwa', meaning: 'Fuerza misteriosa del mundo subterráneo (Uku Pacha), reinterpretada como el diablo.', pronunciation: '[su-pay]' },
          { word: 'Tutamanta', language: 'Kichwa', meaning: 'La hora más profunda y helada de la noche andina.', pronunciation: '[tu-ta-man-ta]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Pacto con Cláusula de Piedra Sagrada',
        text: '"Cantuña", susurró el aparecido con voz de bronce viejo, "pondré a diez mil diablillos a trabajar a la velocidad del rayo. Antes de que el primer gallo cante, el atrio estará perfecto. A cambio, al clarear el sol, tu alma será mía". Cantuña, cuya astucia superaba su desesperación, respondió con temple sereno: "Acepto tu trato, pero bajo una condición sagrada: si al amanecer falta una sola piedra por colocar, el trato quedará nulo de pleno derecho". Lucifer sonrió con arrogancia y sellaron el pacto.',
        illustrationPrompt:
          'Ancient parchment illuminated with blue ethereal fire showing a contract of stonework between human craftsmanship and nocturnal spirits.',
        illustrationStyle: 'Colonial gothic manuscript illumination',
        glossaryTerms: [
          { word: 'Ayni', language: 'Kichwa', meaning: 'Ley cósmica de reciprocidad inquebrantable; todo compromiso debe cumplirse con precisión.', pronunciation: '[ay-ni]' },
          { word: 'Uku Pacha', language: 'Kichwa', meaning: 'El mundo inferior o subterráneo de la cosmovisión andina.', pronunciation: '[u-ku pa-cha]' },
        ],
      },
      {
        scene: 4,
        title: 'Capítulo IV: La Astucia de la Piedra Oculta y el Triunfo',
        text: 'Miles de pequeños seres acarrearon sillares ciclópeos con maestría sobrehumana. Con sigilo, Cantuña tomó un cincel de acero y en la cara oculta del último bloque grabó una bendición invocando al Creador Supremo (Pachacámac). Cuando los diablillos intentaron alzar aquel bloque, no pudieron moverlo. El gallo cantó tres veces sobre las torres. Lucifer extendió sus garras para cobrarse el alma, pero Cantuña señaló el vacío: "¡Mira bien! Falta una piedra. El trato está roto". El diablo rugió derrotado y se hundió en los abismos.',
        illustrationPrompt:
          'Golden sunrise over the Franciscan colonial plaza, an indigenous master stonemason holding an inscribed stone block while defeated shadow spirits vanish into mist.',
        illustrationStyle: 'Vibrant golden hour Andean baroque painting',
        glossaryTerms: [
          { word: 'Inti', language: 'Kichwa', meaning: 'El Padre Sol cuya luz disipa toda sombra e injusticia.', pronunciation: '[in-ti]' },
          { word: 'Kawsay', language: 'Kichwa', meaning: 'La plenitud de la vida preservada con honor y sabiduría.', pronunciation: '[kaw-say]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Cantuña: El Ingenio contra la Noche',
      durationSec: 45,
      synopsis: 'Animación cinemática con estilo de acuarela andina narrando la leyenda más célebre de Quito.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'En el siglo XVI, las campanas de Quito marcaban la hora más oscura del maestro Cantuña.',
          kichwa: 'Chunka sukta patsak watapi, Cantuña mashi llakilla kawsakurka.',
          shuar: 'Yaunchuk nunkanam, Cantuña kakaram emtikiu.',
          en: 'In the 16th century, the bells of Quito tolled Cantuña’s most fateful hour.',
        },
        {
          timestampSec: 15,
          es: 'Los seres del abismo labraron la roca a la velocidad del viento.',
          kichwa: 'Supaypa wawakunaka wayrashina rumita paktachirkakuna.',
          shuar: 'Kakaram shuar rumiatun kakarman takarkari.',
          en: 'Beings of the deep shaped the stones as swift as the mountain wind.',
        },
        {
          timestampSec: 30,
          es: 'Pero una sola piedra faltante bastó para burlar al maligno y salvar el alma de un pueblo.',
          kichwa: 'Shuk rumillami illarka, chaimantami Cantuñaka kispikurka.',
          shuar: 'Chikchik kaya atsau asa, Cantuña tuke iwiaak pujusmi.',
          en: 'Yet a single missing stone was enough to outsmart the shadow and save a soul.',
        },
      ],
      triviaQuestion: {
        question: '¿Cuál fue la condición clave impuesta por Cantuña en el pacto?',
        options: [
          'Que el atrio debía estar 100% completo hasta la última piedra antes del canto del gallo',
          'Que le entregaran monedas de oro incaico',
          'Que las campanas sonaran a medianoche',
        ],
        correctIndex: 0,
        explanation: 'Cantuña estableció que si faltaba una sola piedra antes del primer canto del gallo, el contrato se invalidaba por completo.',
      },
      aiVideoAssetUrl: cantunaVideoImg,
      aiPromptUsed: 'Cinematic digital painting of colonial Quito San Francisco plaza at midnight under stormy andean skies.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'leyenda-guayas-quil',
    category: 'leyenda',
    title: 'Guayas y Quil: La Resistencia de la Ría',
    culturalOrigin: 'Leyenda Histórica Huancavilca (Costa del Guayas)',
    region: 'ecuador-costa',
    coverImage: '🌊🪶',
    readTimeMin: 6,
    isLockedForFree: false,
    summary:
      'La conmovedora gesta del cacique Guayas y su amada Quil, símbolo de la soberanía del pueblo Huancavilca frente a la conquista, cuyo amor dio nombre eterno a la ciudad de Guayaquil.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: Los Señores del Estero y los Manglares',
        text: 'Antes de que los navíos europeos divisaran la amplia desembocadura del gran río, las riberas del estero y las colinas cercanas al cerro Santa Ana estaban gobernadas por el bravo cacique huancavilca Guayas y su valiente esposa Quil. Conocedores de cada corriente de marea, de los balsales de madera ligera y del tejido fino de algodón, protegían a su comunidad entre las brumas doradas del trópico.',
        illustrationPrompt: 'Huancavilca chief and warrior queen standing on coastal balsa rafts near lush mangroves at sunset.',
        illustrationStyle: 'Coastal pre-Columbian epic painting',
        glossaryTerms: [
          { word: 'Huancavilca', language: 'Etnia ancestral', meaning: 'Pueblo navegante y comerciante del litoral ecuatoriano.', pronunciation: '[huan-ca-víl-ca]' },
          { word: 'Balsa', language: 'Español / Litoral', meaning: 'Embarcación tradicional de troncos livianos atados para navegar la ría.', pronunciation: '[bál-sa]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: El Pacto de Libertad en el Cerro',
        text: 'Tras repetidas incursiones extranjeras buscando tesoros que no pertenecían a los invasores, Guayas y Quil fueron rodeados en las laderas que miran al río. Lejos de aceptar la servidumbre o revelar el paradero de las ofrendas sagradas de su pueblo, ambos se miraron con dignidad inquebrantable. "Prefiero que la ría nos abrace libres antes que ver a nuestro pueblo encadenado", pronunció Quil ante la hueste sorprendida.',
        illustrationPrompt: 'Dramatic cliffside overlooking a wide tropical estuary, two proud indigenous leaders choosing freedom over chains.',
        illustrationStyle: 'Heroic historical watercolor',
        glossaryTerms: [
          { word: 'Ría', language: 'Geografía costeña', meaning: 'Desembocadura ancha donde el río dulce se abraza con la marea del mar.', pronunciation: '[rí-a]' },
          { word: 'Soberanía', language: 'Español', meaning: 'Dignidad de decidir el propio destino comunitario sin sometimiento.', pronunciation: '[so-be-ra-ní-a]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Nombre Eterno de la Perla del Pacífico',
        text: 'La tradición oral cuenta que, tras sellar su destino juntos, el espíritu de ambos quedó impregnado en la brisa que recorre el río y en las aguas que bañan la costa. Conmovidos por la valentía del cacique y de la heroína, los cronistas y pobladores unieron sus nombres —Guayas y Quil— para bautizar la futura ciudad portuaria de Guayaquil como recuerdo perenne de coraje y amor por la tierra.',
        illustrationPrompt: 'Golden sunlight reflecting over the modern and ancestral river Guayas estuary with symbolic twin eagle shadows in the sky.',
        illustrationStyle: 'Radiant tropical heritage illustration',
        glossaryTerms: [
          { word: 'Guayaquil', language: 'Toponimia', meaning: 'Fusión legendaria de los nombres del cacique Guayas y su compañera Quil.', pronunciation: '[gua-ya-quíl]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Guayas y Quil: Espíritu Libre del Estuario',
      durationSec: 40,
      synopsis: 'Narrativa audiovisual sobre los defensores huancavilcas que dieron origen simbólico al nombre de Guayaquil.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Entre manglares y balsas navegaban Guayas y Quil, guardianes de la ría.',
          en: 'Among mangroves and balsa rafts sailed Guayas and Quil, guardians of the estuary.',
        },
        {
          timestampSec: 20,
          es: 'Sus nombres unidos permanecen vivos en cada ola del Guayas.',
          en: 'Their united names remain alive in every wave of the Guayas River.',
        },
      ],
      triviaQuestion: {
        question: '¿A qué pueblo ancestral pertenecían el cacique Guayas y Quil?',
        options: ['A la nación Huancavilca del litoral ecuatoriano', 'A los navegantes vikingos', 'A la dinastía Ming'],
        correctIndex: 0,
        explanation: 'Guayas y Quil simbolizan la resistencia histórica del pueblo Huancavilca en la cuenca del río Guayas.',
      },
      aiPromptUsed: 'Huancavilca leaders Guayas and Quil overlooking the Guayas river estuary bordered by golden mangroves.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'myth-dama-tapada',
    category: 'leyenda',
    title: 'La Dama Tapada de Guayaquil',
    culturalOrigin: 'Leyenda Costeña Ecuatoriana (Cuenca del Guayas)',
    region: 'ecuador-costa',
    coverImage: '👒🌙',
    readTimeMin: 7,
    isLockedForFree: true,
    summary:
      'La enigmática silueta envuelta en velos de seda y perfume de azahares que deambulaba por los callejones coloniales del puerto de Guayaquil cautivando a los trasnochadores.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: La Brisa de la Ría y la Silueta Nocturna',
        text: 'Hacia las doce de la noche, cuando la brisa cálida del río Guayas mecía las ramas de los manglares y los faroles de querosén proyectaban sombras titilantes sobre los soportales de madera, solía aparecer una mujer de porte aristocrático. Vestía un vaporoso traje negro de encaje y su rostro permanecía oculto bajo un tupido velo oscuro, desprendiendo un embriagador perfume de azahares.',
        illustrationPrompt: 'Colonial wooden boardwalk along Guayas river illuminated by warm gas lanterns with the silhouette of a veiled aristocratic woman in black.',
        illustrationStyle: 'Vintage sepia watercolor and maritime romanticism',
        glossaryTerms: [
          { word: 'Soportales', language: 'Español costeño', meaning: 'Galerías techadas con columnas de madera típicas del Guayaquil colonial.', pronunciation: '[so-por-tá-les]' },
          { word: 'Azahares', language: 'Flora costeña', meaning: 'Flores blancas del naranjo de perfume penetrante y seductor.', pronunciation: '[a-za-há-res]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: La Fascinación y el Hechizo del Paso Rápido',
        text: 'Los trasnochadores que salían del Malecón caían fascinados por su andar cadencioso. Nadie podía evitar seguirla; parecía levitar sin que sus botines tocaran las piedras de la calzada, manteniendo siempre una distancia fija de cuatro pasos.',
        illustrationPrompt: 'Mysterious night alley in coastal old town, footsteps echoing in cobblestones behind an ethereal flowing black veil.',
        illustrationStyle: 'Nocturnal coastal impressionism',
        glossaryTerms: [
          { word: 'Guadúa', language: 'Flora ecuatoriana', meaning: 'Bambú gigante nativo de la costa utilizado para la arquitectura tradicional.', pronunciation: '[gua-dú-a]' },
          { word: 'Trasnochador', language: 'Español', meaning: 'Persona que recorre las calles en las horas altas de la madrugada.', pronunciation: '[tras-no-cha-dór]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Matapalo Solitario y la Revelación Final',
        text: 'Guiando a su víctima bajo la sombra de un añoso árbol de matapalo, la dama se detenía en seco. Lentamente levantaba el velo para revelar una calavera descarnada, convirtiendo el aroma floral en frío terror nocturno como advertencia contra la vanidad.',
        illustrationPrompt: 'Giant ancient banyan tree under full moon, a sudden dramatic reveal of folkloric supernatural mystery.',
        illustrationStyle: 'Gothic coastal folklore with haunting moonlit contrast',
        glossaryTerms: [
          { word: 'Matapalo', language: 'Botánica tropical', meaning: 'Higuera estranguladora de raíces aéreas gigantescas.', pronunciation: '[ma-ta-pá-lo]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'La Dama Tapada: Sombras de la Ría',
      durationSec: 40,
      synopsis: 'Cortometraje animado sobre la leyenda nocturna del puerto de Guayaquil.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'El río Guayas guarda secretos que solo despiertan al sonar la medianoche.',
          en: 'The Guayas River keeps secrets that awaken only when midnight strikes.',
        },
        {
          timestampSec: 20,
          es: 'Su perfume seduce a los desprevenidos por los callejones coloniales.',
          en: 'Her sweet fragrance seduces the unwary through colonial alleys.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué aroma caracterizaba inicialmente a la Dama Tapada antes de levantar su velo?',
        options: ['Aroma embriagador a violetas y azahares', 'Olor a azufre y humo', 'Perfume de rosas rojas'],
        correctIndex: 0,
        explanation: 'La dama atraía a sus seguidores con un exquisito perfume floral que luego cambiaba drásticamente.',
      },
      aiVideoAssetUrl: damaTapadaVideoImg,
      aiPromptUsed: 'Cinematic digital painting of colonial Guayaquil port at midnight along the river boardwalk.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'leyenda-padre-almeida',
    category: 'leyenda',
    title: 'El Padre Almeida y el Cristo de San Diego',
    culturalOrigin: 'Leyenda Quiteña del Convento de San Diego',
    region: 'ecuador-sierra',
    coverImage: '🕯️🍷',
    readTimeMin: 6,
    isLockedForFree: true,
    summary:
      'La célebre leyenda colonial de Quito sobre un joven fraile amante de la bohemia nocturna que cada madrugada trepaba por la estatua del Cristo yacente para escapar del claustro.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: El Claustro Silencioso y la Ventana Alta',
        text: 'En las apacibles noches del viejo convento de San Diego, al pie del Panecillo, la campana de silencio invitaba al descanso. Sin embargo, el joven padre Almeida sentía el llamado irresistible de las guitarras, los pasillos y el aguardiente de las chicherías quiteñas. Para no ser descubierto por el padre superior, descubrió un atajo audaz por una ventana alta de la capilla.',
        illustrationPrompt: 'Quiet moonlit colonial monastery corridor in Quito with an arched stained-glass window high above.',
        illustrationStyle: 'Andean colonial chiaroscuro',
        glossaryTerms: [
          { word: 'Claustro', language: 'Español colonial', meaning: 'Patio interior rodeado de arcos donde residen y meditan los frailes.', pronunciation: '[cláus-tro]' },
          { word: 'Panecillo', language: 'Toponimia de Quito', meaning: 'Colina emblemática en el corazón de la capital ecuatoriana.', pronunciation: '[pa-ne-cí-llo]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: "¿Hasta cuándo, Padre Almeida?"',
        text: 'Cada noche, Almeida subía apoyando sus sandalias sobre los hombros de una talla sagrada del Cristo en la cruz para alcanzar la ventana y saltar a la calle. Al volver al alba tras largas horas de festejo, repetía el descenso sin remordimiento. Una madrugada, sin embargo, al pisar el madero, la venerada imagen cobró vida y con voz grave que retumbó en toda la nave le preguntó: "¿Hasta cuándo, Padre Almeida?".',
        illustrationPrompt: 'Luminous sacred wooden sculpture speaking softly to a startled young friar holding a small candle at dawn.',
        illustrationStyle: 'Dramatic Quito School baroque oil painting',
        glossaryTerms: [
          { word: 'Escuela Quiteña', language: 'Historia del Arte', meaning: 'Tradición artística mestiza e indígena célebre por sus tallas policromadas.', pronunciation: '[es-cué-la qui-té-ña]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: La Promesa de la Vuelta',
        text: 'El susto dejó al fraile pálido como el mármol, pero su ingenio quiteño alcanzó a responder con sinceridad nerviosa: "¡Hasta la vuelta, Señor!". Desde aquella misma noche, el Padre Almeida abandonó para siempre las escapadas nocturnas y dedicó su vida entera al servicio comunitario en el convento, dejando su famosa réplica grabada en la memoria popular de Quito.',
        illustrationPrompt: 'Sunrise light streaming onto San Diego convent courtyard while the reformed friar tends the herb garden.',
        illustrationStyle: 'Warm colonial watercolor',
        glossaryTerms: [
          { word: 'Chichería', language: 'Tradición andina', meaning: 'Lugar comunitario donde se compartía chicha fermentada y música tradicional.', pronunciation: '[chi-che-rí-a]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Padre Almeida: ¡Hasta la Vuelta, Señor!',
      durationSec: 38,
      synopsis: 'Relato tradicional de la bohemia colonial quiteña y la célebre frase que marcó la historia de San Diego.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Cada medianoche, el joven fraile escapaba por la ventana del convento de San Diego.',
          kichwa: 'Chawpi tutapi, tayta Almeida pakalla llukshirkami.',
          en: 'Every midnight, the young friar slipped out through the high window of San Diego.',
        },
        {
          timestampSec: 19,
          es: 'Hasta que una voz solemne detuvo su paso y transformó su corazón para siempre.',
          kichwa: 'Shuk sinchi rimay payta harkarka, shunkuta tikrachirkami.',
          en: 'Until a solemn voice halted his steps and transformed his heart forever.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué respondió el Padre Almeida al escuchar "¿Hasta cuándo, Padre Almeida?"?',
        options: ['"¡Hasta la vuelta, Señor!"', '"Mañana termino el muro"', '"No volveré a cantar"'],
        correctIndex: 0,
        explanation: 'La respuesta "¡Hasta la vuelta, Señor!" se convirtió en uno de los dichos populares más recordados de Quito.',
      },
      aiPromptUsed: 'Colonial Quito convent of San Diego bathed in moonlight, stained glass and stone arches.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'myth-excalibur',
    category: 'leyenda',
    title: 'El Rey Arturo y la Espada Excalibur',
    culturalOrigin: 'Leyenda Europea Internacional (Tradición Celta)',
    region: 'internacional',
    coverImage: '⚔️🛡️',
    readTimeMin: 7,
    isLockedForFree: true,
    summary:
      'La célebre leyenda medieval del joven humilde que extrae la espada mágica de la piedra, demostrando que la verdadera autoridad surge de la templanza y la Mesa Redonda entre iguales.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: El Yunque de Piedra en la Niebla de Bretaña',
        text: 'En una tierra quebrantada por guerras entre barones, el sabio consejero Merlín erigió en el atrio de una vieja abadía un bloque de mármol con una espada de acero reluciente y la inscripción: "Aquel que extraiga esta espada es el rey legítimo por corazón y justicia". Ni la fuerza bruta ni los ejércitos lograron mover la hoja un milímetro.',
        illustrationPrompt: 'Misty medieval stone clearing with a glowing steel sword embedded in an ancient anvil surrounded by armored knights.',
        illustrationStyle: 'Celtic illuminated manuscript and mythic fantasy',
        glossaryTerms: [
          { word: 'Excalibur', language: 'Tradición artúrica', meaning: 'Espada simbólica otorgada para defender al pueblo con justicia.', pronunciation: '[ex-cá-li-bur]' },
          { word: 'Merlín', language: 'Tradición celta', meaning: 'Consejero sabio que une conocimiento natural y servicio público.', pronunciation: '[mer-lín]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: La Mano del Joven Escudero y la Mesa Redonda',
        text: 'Durante un torneo invernal, el joven escudero Arturo se acercó sin ambición ni vanidad y deslizó la hoja sin esfuerzo en un haz de luz. Al asumir el liderazgo, mandó construir una Mesa Redonda donde todos se sentaran en igualdad de voz, principio análogo a la asamblea comunitaria andina.',
        illustrationPrompt: 'Golden light shining as a young squire lifts a radiant sword effortlessly from the stone anvil.',
        illustrationStyle: 'Heroic Celtic medieval painting',
        glossaryTerms: [
          { word: 'Mesa Redonda', language: 'Filosofía política', meaning: 'Símbolo de igualdad de voces, diálogo y consenso sin cabecera.', pronunciation: '[mé-sa re-dón-da]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Arturo y la Tabla Redonda: El Diálogo entre Iguales',
      durationSec: 35,
      synopsis: 'La leyenda épica que inspira liderazgo participativo sin jerarquías tiránicas.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'La fuerza bruta jamás pudo mover la hoja del destino.',
          en: 'Brute force could never budge the blade of destiny.',
        },
        {
          timestampSec: 18,
          es: 'Solo el corazón que busca la paz y la justicia es digno de gobernar.',
          en: 'Only the heart that seeks peace and justice is worthy to lead.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué simbolizaba la Mesa Redonda en la corte del Rey Arturo?',
        options: [
          'La igualdad y el diálogo sin jerarquías entre los líderes',
          'La riqueza del imperio británico',
          'Un tablero de ajedrez gigante',
        ],
        correctIndex: 0,
        explanation: 'La Mesa Redonda simbolizaba que ningún caballero estaba por encima de otro, buscando el consenso comunitario.',
      },
      aiVideoAssetUrl: excaliburVideoImg,
      aiPromptUsed: 'Cinematic mythological painting of an ancient Celtic misty oak forest clearing with glowing Excalibur.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },

  // =========================================================================
  // CATEGORÍA 2: MITOS (Cosmogonías sagradas, orígenes del mundo y dioses)
  // =========================================================================
  {
    id: 'mito-chimborazo-tungurahua',
    category: 'mito',
    title: 'El Taita Chimborazo y la Mama Tungurahua',
    culturalOrigin: 'Mito Cosmogónico Puruhá y Kichwa (Sierra Centro)',
    region: 'ecuador-sierra',
    coverImage: '🏔️🌋',
    readTimeMin: 7,
    isLockedForFree: false,
    summary:
      'El gran mito andino sobre las montañas sagradas vivientes del Ecuador: el amor titánico entre el nevado Chimborazo, la ardiente Tungurahua, los celos del Altar y el nacimiento de los valles.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: Los Apus Tutelares de la Cordillera',
        text: 'Para los pueblos antiguos de la Sierra Central, los volcanes no son simples moles de roca sino seres espirituales tutelares llamados Apus. Al centro del horizonte se alzaba imponente el Taita Chimborazo, coronado de nieves eternas que conversan con las estrellas. Frente a él latía con fuego creador la hermosa Mama Tungurahua, cuyo corazón volcánico fertilizaba los valles con ceniza tibia y vertientes cristalinas.',
        illustrationPrompt: 'Majestic snow-capped Chimborazo facing glowing volcanic Tungurahua across mist-filled Andean valleys at dawn.',
        illustrationStyle: 'Andean cosmogonic sacred art',
        glossaryTerms: [
          { word: 'Apu', language: 'Kichwa', meaning: 'Espíritu mayor o montaña sagrada protectora de las comunidades.', pronunciation: '[á-pu]' },
          { word: 'Razu', language: 'Kichwa', meaning: 'Nieve eterna de las cumbres más altas del cielo andino.', pronunciation: '[ra-zu]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: El Desafío del Capac Urcu y la Erupción',
        text: 'Dice el mito que el imponente El Altar (Capac Urcu) rivalizó con el Chimborazo por el afecto de la Mama Tungurahua. Durante eras de truenos y relámpagos, las montañas dialogaron con rugidos sísmicos y lluvias de piedra incandescente. El Taita Chimborazo defendió su unión sagrada cubriendo sus flancos con ventiscas plateadas mientras la Mama Tungurahua enviaba columnas de humo para templar el valle.',
        illustrationPrompt: 'Mythic volcanic dialogue with silver lightning and glowing ash clouds over towering Andean peaks.',
        illustrationStyle: 'Epic mythic realism',
        glossaryTerms: [
          { word: 'Capac Urcu', language: 'Kichwa', meaning: 'El Señor o Montaña Soberana, nombre ancestral del volcán El Altar.', pronunciation: '[ca-pác ur-cu]' },
          { word: 'Ninan', language: 'Kichwa', meaning: 'Fuego sagrado que transforma y renueva la fertilidad de la tierra.', pronunciation: '[ni-nan]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Nacimiento del Guagua Pichincha y la Fertilidad',
        text: 'De la unión armónica entre la nieve del Chimborazo y el fuego de la Tungurahua nacieron las aguas puras de los deshielos que alimentan los ríos Pastaza y Guayas, así como los cerros jóvenes que custodian los sembríos de maíz y quinua. Cada vez que una nube blanca corona al Taita y una fumarola tibia eleva la Mama, las comunidades saben que la Pachamama sigue viva y fecunda.',
        illustrationPrompt: 'Fertile terraced quinoa and corn fields nourished by glacial streams uniting snow and volcanic warmth.',
        illustrationStyle: 'Golden Andean harmony painting',
        glossaryTerms: [
          { word: 'Pachamama', language: 'Kichwa', meaning: 'Madre Tierra y Cosmos viviente que sustenta toda existencia.', pronunciation: '[pa-cha-ma-ma]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Taita Chimborazo y Mama Tungurahua: Mito del Origen',
      durationSec: 44,
      synopsis: 'Cosmovisión andina sobre cómo el hielo y el fuego dieron origen a los ríos y valles del Ecuador.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'En el principio, las grandes montañas respiraban fuego, viento y nieve eterna.',
          kichwa: 'Kallari pachapi, hatun urkukunaka ninata, rasutapash samarkakuna.',
          en: 'In the beginning, the great peaks breathed fire, wind, and eternal snow.',
        },
        {
          timestampSec: 22,
          es: 'De su abrazo nacieron los ríos sagrados que nutren nuestra Pachamama.',
          kichwa: 'Paykunapa ukllaymanta mayukuna Pachamamata kawsachinkapak shamurkakuna.',
          en: 'From their embrace were born the sacred rivers nourishing our Pachamama.',
        },
      ],
      triviaQuestion: {
        question: 'En la cosmovisión andina, ¿qué representan las montañas como el Chimborazo?',
        options: [
          'Apus: espíritus sagrados tutelares que protegen el agua y la vida',
          'Edificios construidos por piratas',
          'Simples rocas sin significado cultural',
        ],
        correctIndex: 0,
        explanation: 'Los Apus son montañas sagradas vivientes cuyo deshielo y energía sostienen la vida agrícola y comunitaria.',
      },
      aiPromptUsed: 'Taita Chimborazo snow peak and glowing Mama Tungurahua under starry Milky Way of the Andes.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'myth-etsa-shuar',
    category: 'mito',
    title: 'Etsa y el Gigante Caníbal Iwia',
    culturalOrigin: 'Mito Fundacional de la Nación Shuar (Amazonía)',
    region: 'ecuador-oriente',
    coverImage: '🏹🦜',
    readTimeMin: 9,
    isLockedForFree: true,
    summary:
      'El gran mito amazónico del héroe solar Etsa, quien devolvió la vida a todas las aves de la selva soplando plumas por su cerbatana sagrada y derrotó la codicia del monstruoso Iwia.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: El Gran Silencio de la Selva Primordial',
        text: 'En los orígenes del tiempo en la Amazonía vivía Iwia, un gigante voraz que devoraba sin respeto los frutos de la creación. Iwia crió al joven Etsa engañándolo para que cazara todas las aves del dosel con una cerbatana de chonta hasta sumir la selva en el silencio.',
        illustrationPrompt: 'Deep Amazon rainforest canopy with giant kapok trees, young indigenous hunter with ceremonial blowgun.',
        illustrationStyle: 'Vibrant tropical indigenous surrealism',
        glossaryTerms: [
          { word: 'Umfák', language: 'Shuar', meaning: 'Cerbatana tradicional fabricada con palma de chonta.', pronunciation: '[um-fák]' },
          { word: 'Iwia', language: 'Shuar', meaning: 'Espíritu de la avaricia desmedida que rompe el equilibrio ecológico.', pronunciation: '[i-wi-a]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: La Voz Verdadera de la Paloma Yapankam',
        text: 'Junto a una cascada sagrada, la última paloma Yapankam habló a Etsa con voz espiritual, revelándole su verdadero linaje y el crimen cometido por Iwia contra su pueblo.',
        illustrationPrompt: 'Luminous small sacred dove perched upon a mossy branch speaking to a young hunter by a misty waterfall.',
        illustrationStyle: 'Bioluminescent Amazonian dreamscape',
        glossaryTerms: [
          { word: 'Yapankam', language: 'Shuar', meaning: 'Paloma mensajera de la memoria y verdad espiritual.', pronunciation: '[ya-pan-kam]' },
          { word: 'Arutam', language: 'Shuar', meaning: 'Energía espiritual suprema presente en cascadas sagradas.', pronunciation: '[a-ru-tam]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Aliento Sagrado y el Retorno de las Aves',
        text: 'Siguiendo el consejo de Yapankam, Etsa introdujo las plumas guardadas en su cerbatana y sopló hacia los cuatro rumbos. Millones de aves iridiscentes renacieron poblando nuevamente la selva amazónica.',
        illustrationPrompt: 'Explosion of thousands of iridescent tropical birds bursting from a ceremonial blowgun into the golden jungle sky.',
        illustrationStyle: 'Masterpiece mythological Amazonian realism',
        glossaryTerms: [
          { word: 'Etsa', language: 'Shuar', meaning: 'El héroe solar civilizador protector de la vida amazónica.', pronunciation: '[et-sa]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Etsa: El Retorno de las Aves Sagradas',
      durationSec: 50,
      synopsis: 'Mito cosmogónico Shuar sobre la creación de las aves y el equilibrio de la selva.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'En la gran selva amazónica, el silencio anunciaba el reinado de Iwia.',
          shuar: 'Ikiamnum Iwia nunkun takau.',
          en: 'In the great Amazonian rainforest, silence signaled the reign of Iwia.',
        },
        {
          timestampSec: 25,
          es: 'Pero el aliento de Etsa encendió las alas de la libertad.',
          shuar: 'Etsa nankamaku kakaram chinki pawa.',
          en: 'Yet Etsa’s breath ignited the wings of ancestral freedom.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué animal reveló a Etsa la verdad sobre el gigante Iwia?',
        options: ['La pequeña paloma Yapankam', 'Un jaguar dorado', 'Una serpiente boa'],
        correctIndex: 0,
        explanation: 'Fue la sabia paloma Yapankam quien abrió los ojos de Etsa para restaurar el equilibrio de la selva.',
      },
      aiVideoAssetUrl: etsaVideoImg,
      aiPromptUsed: 'Deep Amazonian rainforest, Shuar solar hero releasing luminous birds from a chonta blowgun.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'mito-nunkui-shuar',
    category: 'mito',
    title: 'Nunkui y el Origen de los Alimentos Sagrados',
    culturalOrigin: 'Mito Agrícola Sagrado Shuar (Amazonía Sur)',
    region: 'ecuador-oriente',
    coverImage: '🌱🏺',
    readTimeMin: 8,
    isLockedForFree: true,
    summary:
      'El mito primordial que explica cómo Nunkui, la deidad femenina que habita bajo la tierra fértil, entregó a las mujeres Shuar la yuca, el plátano, la arcilla y los cantos sagrados de cultivo.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: Los Días del Hambre y el Rastro en el Río',
        text: 'En un tiempo remoto anterior al cultivo, las familias amazónicas solo conocían las hojas silvestres y la corteza amarga del bosque. Un día, una madre Shuar vio flotar por el río cáscaras frescas de una raíz blanca desconocida y siguió el curso de las aguas hasta hallar a una mujer misteriosa rodeada de huertos exuberantes: era Nunkui, la dueña secreta del subsuelo fértil.',
        illustrationPrompt: 'Indigenous Amazonian mother following sparkling river currents to a hidden subterranean garden of glowing cassava plants.',
        illustrationStyle: 'Earth-toned Amazonian sacred mural',
        glossaryTerms: [
          { word: 'Nunkui', language: 'Shuar', meaning: 'Espíritu sagrado femenino de la tierra fértil, la horticultura y la alfarería.', pronunciation: '[nun-kuí]' },
          { word: 'Mama', language: 'Shuar', meaning: 'Yuca o mandioca, alimento central que sostiene la vida diaria amazónica.', pronunciation: '[ma-ma]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: El Don de la Niña Prodigiosa y los Anent',
        text: 'Nunkui confió a la mujer una pequeña hija espiritual con el poder de hacer brotar yuca madura, maní, camote y barro fino con tan solo pronunciar su nombre con respeto. Pero advirtió una regla sagrada: nadie debía maltratar ni burlarse de la niña. Durante meses, las huertas (Aja) florecieron con abundancia jamás vista mientras las mujeres aprendían los anent o cantos rituales de siembra.',
        illustrationPrompt: 'Lush Amazonian forest clearing overflowing with cassava, plantains and painted ceramic bowls as women sing harvest songs.',
        illustrationStyle: 'Lush tropical mythological realism',
        glossaryTerms: [
          { word: 'Aja', language: 'Shuar', meaning: 'Huerta biodiversa tradicional cultivada con respeto espiritual.', pronunciation: '[á-ja]' },
          { word: 'Anent', language: 'Shuar', meaning: 'Canto íntimo y plegaria musical para cuidar plantas, familia y armonía.', pronunciation: '[a-nent]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: La Lección de Gratitud hacia la Madre Tierra',
        text: 'Cuando unos niños desobedientes arrojaron ceniza a los ojos de la pequeña enviada, ella se refugió en el interior de un tallo de caña guadúa y descendió nuevamente bajo la tierra, dejando las plantas encogidas hasta su tamaño actual que requiere cuidado humano y trabajo amoroso. Desde entonces, cada mujer Shuar canta anent a Nunkui antes de plantar, recordando que todo alimento nace del respeto y la gratitud.',
        illustrationPrompt: 'Bamboo grove glowing with golden roots sinking back into dark fertile earth while community preserves sacred seeds.',
        illustrationStyle: 'Mystical botanical oil illustration',
        glossaryTerms: [
          { word: 'Penker Pujustin', language: 'Shuar', meaning: 'El Buen Vivir en reciprocidad con la selva y sus espíritus.', pronunciation: '[pen-ker pu-jus-tin]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Nunkui: El Canto de la Tierra Fértil',
      durationSec: 46,
      synopsis: 'Historia sagrada sobre el origen de la agricultura amazónica y la alfarería de barro vivo.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Bajo la tierra tibia de la selva habitaba Nunkui, madre de toda cosecha.',
          shuar: 'Nunka initik Nunkui pujumi, yurumak susau.',
          en: 'Beneath the warm forest soil dwelt Nunkui, mother of every harvest.',
        },
        {
          timestampSec: 23,
          es: 'Con cada canto anent, las semillas recuerdan la promesa de abundancia y cuidado.',
          shuar: 'Anentjai, ajanam yurumak penker tsapari.',
          en: 'With each anent song, the seeds remember the promise of abundance and care.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué enseña el mito de Nunkui sobre la relación con la huerta (Aja)?',
        options: [
          'Que la tierra y los alimentos exigen respeto, cuidado y cantos de gratitud (anent)',
          'Que no es necesario sembrar ni cuidar las plantas',
          'Que los ríos se secan si se canta en la selva',
        ],
        correctIndex: 0,
        explanation: 'El mito enseña que la abundancia de Nunkui exige gratitud, respeto y dedicación en la huerta familiar.',
      },
      aiPromptUsed: 'Sacred Amazonian goddess Nunkui surrounded by cassava roots, clay vessels and glowing forest mist.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'mito-cuicocha',
    category: 'mito',
    title: 'La Laguna de Cuicocha y la Pacarina de Imbabura',
    culturalOrigin: 'Mito Sagrado Otavalo-Kichwa (Sierra Norte)',
    region: 'ecuador-sierra',
    coverImage: '💠🏞️',
    readTimeMin: 6,
    isLockedForFree: true,
    summary:
      'El mito ancestral de Imbabura sobre la laguna cratérica de Cuicocha ("Laguna de los Cuyes") como Pacarina o útero sagrado de purificación, agua espejo y renacimiento espiritual.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: El Espejo de Plata al Pie del Cotacachi',
        text: 'En el corazón azul de la caldera del volcán Mama Cotacachi reposa la laguna de Cuicocha, cuyas dos islas centrales —Teodoro Wolf y Yerovi— se alzan como guardianas de piedra cubiertas de orquídeas andinas. En la tradición oral de los pueblos Kayambi y Otavalo, estas aguas profundas no provienen de lluvias pasajeras sino del manantial originario o Pacarina del cosmos.',
        illustrationPrompt: 'Crystal deep-blue volcanic crater lake with two emerald-free sapphire rocky islands under snow-dusted Cotacachi peak.',
        illustrationStyle: 'Highland Andean sacred landscape',
        glossaryTerms: [
          { word: 'Pacarina', language: 'Kichwa', meaning: 'Lugar sagrado de origen mítico de los pueblos, aguas y linajes.', pronunciation: '[pa-ca-rí-na]' },
          { word: 'Kuykucha', language: 'Kichwa', meaning: 'Laguna del Cuy, por la forma curva de una de sus islas interiores.', pronunciation: '[kuy-ku-cha]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: El Baño Ritual del Inti Raymi',
        text: 'Según el mito, cuando el Taita Imbabura y la Mama Cotacachi dialogan mediante nubes de algodón sobre el valle, el agua de la laguna absorbe la memoria del Sol y de la Luna (Killa). Antes de cada equinoccio y fiesta del Inti Raymi, los yachaks y danzantes acuden al alba para recibir el Armay Chishi, baño ritual que limpia las penas acumuladas del ciclo anterior.',
        illustrationPrompt: 'Dawn reflection in volcanic crater lake with golden ripples and Andean weavers performing sacred water ceremony.',
        illustrationStyle: 'Luminist Andean watercolor',
        glossaryTerms: [
          { word: 'Yachak', language: 'Kichwa', meaning: 'Sabio o sabedora espiritual que interpreta los ciclos del agua y los astros.', pronunciation: '[ya-chak]' },
          { word: 'Killa', language: 'Kichwa', meaning: 'La Luna sagrada que rige las aguas y mareas internas de la tierra.', pronunciation: '[ki-lla]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: Las Islas Gemelas de la Dualidad',
        text: 'Los abuelos enseñan que las dos islas en medio del cráter simbolizan el Yanantin: la complementariedad sagrada entre fuerzas opuestas y necesarias como el día y la noche, el frío de la altura y la tibieza del valle. Quien contempla Cuicocha en silencio escucha el pulso profundo de la memoria andina.',
        illustrationPrompt: 'Twin volcanic islands illuminated by golden sunset rays forming a balanced mandala on glassy crater waters.',
        illustrationStyle: 'Symmetric sacred Andean art',
        glossaryTerms: [
          { word: 'Yanantin', language: 'Kichwa', meaning: 'Principio filosófico de dualidad complementaria y equilibrio armónico.', pronunciation: '[ya-nan-tin]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Cuicocha: El Espejo Sagrado de Yanantin',
      durationSec: 42,
      synopsis: 'Viaje mítico hacia la laguna sagrada del Cotacachi y su significado espiritual en Imbabura.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Al pie de la Mama Cotacachi duerme el espejo de agua más antiguo del norte.',
          kichwa: 'Mama Cotacachi chakipi, hatun pakarina yaku samakun.',
          en: 'At the foot of Mama Cotacachi sleeps the oldest water mirror of the northern Andes.',
        },
        {
          timestampSec: 21,
          es: 'Sus dos islas enseñan el equilibrio eterno del Yanantin.',
          kichwa: 'Iskay allpa wawakunaka Yanantin yuyayta rikuchinkuna.',
          en: 'Its two islands teach the eternal balance of Yanantin.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué principio andino simbolizan las dos islas gemelas en el centro de Cuicocha?',
        options: [
          'Yanantin: la dualidad complementaria y el equilibrio armónico',
          'Un muro de defensa militar',
          'La separación definitiva entre el cielo y el mar',
        ],
        correctIndex: 0,
        explanation: 'Las islas reflejan el Yanantin, concepto fundamental de equilibrio entre fuerzas complementarias.',
      },
      aiPromptUsed: 'Cotacachi crater lake Cuicocha at sunrise with twin islands reflecting snowy Andean peaks.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'mito-prometeo',
    category: 'mito',
    title: 'Prometeo y el Fuego del Conocimiento',
    culturalOrigin: 'Mito Universal Griego (Cosmogonía Clásica)',
    region: 'internacional',
    coverImage: '🔥🏛️',
    readTimeMin: 7,
    isLockedForFree: true,
    summary:
      'El célebre mito de la antigüedad clásica sobre el titán Prometeo, quien desafió la prohibición del Olimpo para entregar a la humanidad el fuego, la escritura, las ciencias y la esperanza.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: La Humanidad en la Oscuridad Primordial',
        text: 'En el alba del mundo mítico griego, mientras los dioses habitaban en palacios luminosos en la cima del monte Olimpo, los primeros seres humanos moraban en cavernas frías sin herramientas ni artes. Zeus había prohibido compartir el fuego celeste temiendo que los mortales igualaran el poder divino.',
        illustrationPrompt: 'Ancient Greek limestone mountains under dramatic dusk clouds, primitive human shelters illuminated only by faint starlight.',
        illustrationStyle: 'Classical Mediterranean fresco',
        glossaryTerms: [
          { word: 'Olimpo', language: 'Mitología griega', meaning: 'Montaña sagrada considerada morada de las deidades clásicas.', pronunciation: '[o-lím-po]' },
          { word: 'Titán', language: 'Mitología griega', meaning: 'Deidad primordial anterior al reinado de los dioses olímpicos.', pronunciation: '[ti-tán]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: La Chispa Oculta en el Tallo de Hinojo',
        text: 'Movido por profunda compasión, el titán Prometeo —cuyo nombre significa "el que piensa con anticipación"— ascendió al taller celeste de Hefesto, tomó una chispa viva del fuego sagrado y la ocultó dentro de un tallo hueco de cañaheja. Al descender a la tierra y encender la primera hoguera humana, no solo entregó calor: despertó también la astronomía, las matemáticas, la música y el arte de dialogar.',
        illustrationPrompt: 'Noble classical titan holding a glowing golden ember inside a hollow reed staff while amazed mortals gather around.',
        illustrationStyle: 'Neoclassical oil painting with luminous firelight',
        glossaryTerms: [
          { word: 'Prometeo', language: 'Griego antiguo', meaning: 'Significa "Previsión" o quien medita las consecuencias por el bien común.', pronunciation: '[pro-me-té-o]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Legado de la Ciencia y la Libertad',
        text: 'Aunque Zeus castigó severamente al titán encadenándolo en el Cáucaso por su desafío, la llama del conocimiento jamás volvió a apagarse sobre la tierra. La humanidad aprendió a leer las estrellas, construir ciudades y buscar la verdad con pensamiento libre, convirtiendo a Prometeo en símbolo eterno de la educación compartida.',
        illustrationPrompt: 'Ancient Greek academy illuminated by warm torches under constellations as scholars debate geometry and philosophy.',
        illustrationStyle: 'Radiant classical temple artwork',
        glossaryTerms: [
          { word: 'Logos', language: 'Griego antiguo', meaning: 'Razón, palabra articulada y comprensión ordenada del universo.', pronunciation: '[ló-gos]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Prometeo: La Llama de la Sabiduría Humana',
      durationSec: 40,
      synopsis: 'Mito clásico universal sobre el origen del fuego, las artes y la curiosidad científica.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'En el principio, la humanidad esperaba en silencio una chispa de luz.',
          en: 'In the beginning, humanity waited in silence for a spark of light.',
        },
        {
          timestampSec: 20,
          es: 'Con el fuego nacieron las ciencias, la música y el pensamiento libre.',
          en: 'With fire were born the sciences, music, and free thought.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué dones acompañaron la entrega del fuego según el mito de Prometeo?',
        options: [
          'La escritura, las matemáticas, la música y el conocimiento científico',
          'Únicamente armas de guerra',
          'Oro infinito bajo el océano',
        ],
        correctIndex: 0,
        explanation: 'El fuego prometéico simboliza el despertar de todas las artes, la ciencia y la cultura humana.',
      },
      aiPromptUsed: 'Prometheus handing the sacred flame of knowledge beneath a starry Greek sky.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  // =========================================================================
  // AMPLIACIÓN DEL CATÁLOGO: MÁS LEYENDAS Y MITOS DEL ECUADOR Y EL MUNDO
  // =========================================================================
  {
    id: 'leyenda-capa-estudiante',
    category: 'leyenda',
    title: 'La Capa del Estudiante',
    culturalOrigin: 'Leyenda Quiteña (Centro Histórico y El Tejar)',
    region: 'ecuador-sierra',
    coverImage: '🧥🌙',
    readTimeMin: 6,
    isLockedForFree: false,
    summary:
      'La famosa historia del joven universitario de Quito que apostó caminar a medianoche hasta la tumba más apartada de El Tejar y clavó por error su propia capa junto a la cruz de piedra.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: La Apuesta en el Viejo Mesón de la Ronda',
        text: 'En las noches neblinosas del Quito antiguo, un estudiante de jurisprudencia apodado Juan el Valiente compartía canelazos tibios con sus compañeros cerca de la calle de La Ronda. Su orgullo contrastaba con sus botas gastadas y su única prenda de abrigo: una capa española oscura heredada de su abuelo. Entre risas y desafíos juveniles, sus amigos le apostaron un par de botas nuevas y monedas para sus libros si lograba atravesar a medianoche el silencioso cementerio de El Tejar y clavar una estaca de madera frente al mausoleo central.',
        illustrationPrompt: 'Foggy cobblestone street in old colonial Quito, young university student in a dark flowing cloak holding a lantern.',
        illustrationStyle: 'Nocturnal Andean colonial illustration',
        glossaryTerms: [
          { word: 'Canelazo', language: 'Tradición quiteña', meaning: 'Bebida caliente tradicional de canela y naranjilla para templar el frío andino.', pronunciation: '[ca-ne-lá-zo]' },
          { word: 'El Tejar', language: 'Toponimia', meaning: 'Histórico barrio y antiguo camposanto ubicado en las faldas del Pichincha.', pronunciation: '[el te-jár]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: El Viento Helado y la Estaca en la Oscuridad',
        text: 'Cuando el reloj de La Merced dio las doce campanadas, el joven ascendió entre callejones empinados hasta el portón de hierro. Con el pulso acelerado por el silencio absoluto y el ulular del viento que bajaba del volcán, caminó hasta la cruz convenida, se agachó entre la hierba húmeda y golpeó con una piedra la estaca de madera hasta hundirla firme en la tierra.',
        illustrationPrompt: 'Moonlit stone cemetery gate on hillside overlooking sleeping colonial city spires in blue mist.',
        illustrationStyle: 'Atmospheric gothic watercolor',
        glossaryTerms: [
          { word: 'Alba', language: 'Español', meaning: 'Primera claridad del amanecer sobre los tejados coloniales.', pronunciation: '[ál-ba]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Tirón Nocturno y el Desenlace al Amanecer',
        text: 'Al intentar incorporarse para huir triunfante, Juan sintió un tirón violento desde atrás que le impedía dar un paso. Convencido de que una mano invisible lo retenía desde la tumba, cayó desmayado por la impresión. A la mañana siguiente, sus amigos acudieron preocupados y descubrieron la verdad con asombro: en la oscuridad, el propio estudiante había atravesado con la estaca el borde largo de su capa negra, dejándose atrapado a sí mismo.',
        illustrationPrompt: 'Morning sunlight revealing a wooden stake pinning the hem of a black student cloak beside an old stone cross.',
        illustrationStyle: 'Warm Quito school storybook realism',
        glossaryTerms: [
          { word: 'Sugestión', language: 'Psicología / Español', meaning: 'Fuerza del temor imaginado que supera a la realidad física.', pronunciation: '[su-ges-tión]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'La Capa del Estudiante: Sombras en El Tejar',
      durationSec: 40,
      synopsis: 'Relato tradicional de Quito sobre el valor, el miedo y cómo la imaginación puede jugarnos una mala pasada.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Una apuesta nocturna llevó al joven estudiante hasta lo alto de El Tejar.',
          kichwa: 'Tutamanta rimanakuyka wamra yachakukta urkuman pusharka.',
          en: 'A midnight bet led the young student up to the quiet hill of El Tejar.',
        },
        {
          timestampSec: 20,
          es: 'Al alba descubrieron que el único fantasma era su propia capa clavada.',
          kichwa: 'Pakariypi paypa pachallami rumi kuchupi watarishka kashka.',
          en: 'At dawn they discovered the only ghost was his own pinned cloak.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué fue lo que realmente sujetó al estudiante junto a la cruz de piedra?',
        options: [
          'Su propia capa atravesada accidentalmente por la estaca que él mismo clavó',
          'Un guardia colonial escondido',
          'Las raíces de un árbol gigante',
        ],
        correctIndex: 0,
        explanation: 'Con la oscuridad y los nervios, clavó el borde de su propia capa contra el suelo al enterrar la estaca.',
      },
      aiPromptUsed: 'Student in dark colonial cloak standing near cobblestone Quito square beneath foggy Andean twilight.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'leyenda-casa-1028',
    category: 'leyenda',
    title: 'La Casa 1028 y el Toro Negro de Quito',
    culturalOrigin: 'Leyenda Urbana Colonial (Plaza Grande de Quito)',
    region: 'ecuador-sierra',
    coverImage: '🐂🏰',
    readTimeMin: 6,
    isLockedForFree: true,
    summary:
      'El enigma de Bella Aurora y la corrida taurina colonial en la Plaza de la Independencia, donde un imponente toro negro abandonó el ruedo y subió las escaleras de piedra hasta su balcón.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: Los Balcones de Madera sobre la Plaza Mayor',
        text: 'Durante las fiestas populares de la antigua Quito colonial, la Plaza Grande se transformaba en una arena improvisada rodeada de tablados, banderines y balcones floridos. En la residencia marcada mucho después con el número 1028 vivía la joven Bella Aurora junto a sus padres, disfrutando la música de las bandas de pueblo y la alegría festiva.',
        illustrationPrompt: 'Historic Quito main square balconies adorned with crimson tapestries during a colonial festival.',
        illustrationStyle: 'Classical Latin American colonial oil painting',
        glossaryTerms: [
          { word: 'Tablado', language: 'Español colonial', meaning: 'Graderío de madera levantado temporalmente en plazas públicas.', pronunciation: '[ta-blá-do]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: La Mirada del Toro Oscuro y la Persecución',
        text: 'Al abrirse el toril, saltó al centro un toro negro de mirada fija y astas afiladas. Lejos de embestir a los capotes, el animal alzó la vista hacia el balcón donde se asomaba Bella Aurora. Desafiando cercos y lanzas, el toro irrumpió por el zaguán abierto, subió retumbando las gradas de piedra y recorrió la galería superior hasta el salón donde la joven había buscado refugio.',
        illustrationPrompt: 'Majestic dark bull climbing stone colonial staircase under dramatic lantern shadows.',
        illustrationStyle: 'Dramatic chiaroscuro folklore art',
        glossaryTerms: [
          { word: 'Zaguán', language: 'Arquitectura colonial', meaning: 'Portal de entrada ancho que conecta la calle con el patio interior.', pronunciation: '[za-guán]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Misterio que Perdura en la Piedra',
        text: 'Aterrada ante la presencia inexplicable del animal frente a su puerta, Bella Aurora enfermó de espanto y su familia abandonó la casona para siempre, mientras el toro desaparecía misteriosamente sin dejar huella en el patio. Desde aquel día, la Casa 1028 permaneció como relato obligado en los recorridos nocturnos por el Centro Histórico.',
        illustrationPrompt: 'Mysterious colonial doorway number 1028 bathed in amber streetlamp light in quiet Quito night.',
        illustrationStyle: 'Atmospheric heritage illustration',
        glossaryTerms: [
          { word: 'Centro Histórico', language: 'Patrimonio UNESCO', meaning: 'Núcleo colonial de Quito célebre por sus iglesias y leyendas.', pronunciation: '[cén-tro his-tó-ri-co]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'La Casa 1028: El Enigma de la Plaza Grande',
      durationSec: 38,
      synopsis: 'Misterio clásico del centro histórico quiteño transmitido de generación en generación.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'En la antigua Plaza Grande, el estruendo de cascos detuvo la fiesta colonial.',
          en: 'In the old Main Square, the thunder of hooves halted the colonial festival.',
        },
        {
          timestampSec: 19,
          es: 'Aún hoy los viajeros contemplan el portal de la legendaria Casa 1028.',
          en: 'Even today travelers gaze at the doorway of the legendary House 1028.',
        },
      ],
      triviaQuestion: {
        question: '¿Dónde ocurrió la célebre aparición de la leyenda de la Casa 1028?',
        options: [
          'En una casona colonial frente a la Plaza Grande de Quito',
          'En un faro del océano Atlántico',
          'En una pirámide de Egipto',
        ],
        correctIndex: 0,
        explanation: 'La historia está ligada a la antigua casona colonial ubicada en la Plaza Grande (Plaza de la Independencia) de Quito.',
      },
      aiPromptUsed: 'Historic colonial mansion doorway in Quito square illuminated by warm evening lanterns.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'leyenda-tintin',
    category: 'leyenda',
    title: 'El Tintín de los Manglares y Cacaotales',
    culturalOrigin: 'Leyenda Montubia del Litoral Ecuatoriano',
    region: 'ecuador-costa',
    coverImage: '👒🌾',
    readTimeMin: 6,
    isLockedForFree: false,
    summary:
      'La popular leyenda campesina de la costa ecuatoriana sobre el travieso duende de sombrero gigante y pies vueltos que silba entre los arrozales y plantaciones de cacao al caer la tarde.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: El Silbido Agudo bajo los Cacaotales',
        text: 'Cuando el sol se esconde tras los esteros y las luciérnagas encienden los sembríos de cacao y banano en Los Ríos, Manabí y Guayas, los abuelos montubios aconsejan recoger las herramientas antes de anochecer. Se escucha entonces un silbido agudo y rítmico —"tin-tin, tin-tin"— que parece venir de lejos cuando en realidad está junto a la cerca de caña guadúa.',
        illustrationPrompt: 'Lush coastal Ecuador cacao grove at sunset with glowing fireflies and rustic bamboo farmhouse.',
        illustrationStyle: 'Vibrant coastal montubio folk painting',
        glossaryTerms: [
          { word: 'Montubio', language: 'Identidad ecuatoriana', meaning: 'Pueblo campesino mestizo del litoral célebre por su amorfinos y tradición oral.', pronunciation: '[mon-tú-bio]' },
          { word: 'Cacaotal', language: 'Agroecología costeña', meaning: 'Plantación sombreada de cacao fino de aroma.', pronunciation: '[ca-cao-tál]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: El Sombrero de Paja Toquilla y las Huellas Invertidas',
        text: 'Quienes lograron atisbarlo entre los matorrales describen un personaje pequeño cubierto con un inmenso sombrero de paja toquilla que le oculta el rostro. Sus pies están vueltos hacia atrás para despistar a quien siga sus huellas en el barro húmedo de las fincas.',
        illustrationPrompt: 'Whimsical nocturnal coastal spirit wearing an oversized woven straw hat standing near misty river reeds.',
        illustrationStyle: 'Magical realism folklore art',
        glossaryTerms: [
          { word: 'Paja Toquilla', language: 'Artesanía ancestral', meaning: 'Fibra vegetal ecuatoriana tejida a mano para sombreros finos.', pronunciation: '[pá-ja to-quí-lla]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: Amorfinos y Guitarra para Ahuyentar el Hechizo',
        text: 'La sabiduría popular montubia enseñó el remedio infalible frente al travieso espíritu: reunir a la familia en el portal con música de guitarra, décimas alegres y amorfinos picantes, además de esparcir ceniza tibia o colocar tijeras abiertas en señal de protección. Frente a la alegría comunitaria, el Tintín se aleja silbando hacia el manglar.',
        illustrationPrompt: 'Family gathering on wooden coastal veranda playing acoustic guitar beneath warm lantern light.',
        illustrationStyle: 'Warm celebratory Latin American illustration',
        glossaryTerms: [
          { word: 'Amorfino', language: 'Literatura oral', meaning: 'Copla rimada ingeniosa cantada con humor en las fiestas montubias.', pronunciation: '[a-mor-fí-no]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'El Tintín: Silbidos del Manglar Montubio',
      durationSec: 39,
      synopsis: 'Folclore vivo de la costa ecuatoriana lleno de música, amorfinos y misterio rural.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Al caer la tarde en el cacao, un silbido agudo recorre los senderos montubios.',
          en: 'At dusk in the cacao groves, a sharp whistle echoes along the coastal trails.',
        },
        {
          timestampSec: 20,
          es: 'Con amorfinos y guitarra en el portal, la alegría siempre protege el hogar.',
          en: 'With amorfinos and guitar on the porch, joy always protects the home.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué particularidad física del Tintín despista a quienes siguen sus rastros en el barro?',
        options: [
          'Lleva los pies vueltos hacia atrás y un enorme sombrero de paja toquilla',
          'Tiene alas metálicas gigantes',
          'Deja huellas de ruedas de carreta',
        ],
        correctIndex: 0,
        explanation: 'En la tradición montubia, sus huellas invertidas hacen creer que camina en sentido contrario.',
      },
      aiPromptUsed: 'Montubio countryside cacao farm in coastal Ecuador at golden dusk with glowing fireflies.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'leyenda-cueva-tayos',
    category: 'leyenda',
    title: 'Los Guardianes de la Cueva de los Tayos',
    culturalOrigin: 'Leyenda Amazónica de Morona Santiago',
    region: 'ecuador-oriente',
    coverImage: '🦇💎',
    readTimeMin: 7,
    isLockedForFree: true,
    summary:
      'La fascinante leyenda de las cavernas milenarias de Morona Santiago, donde los sabios Shuar descienden con lianas sagradas junto a las aves nocturnas tayos para custodiar la memoria de la tierra.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: El Descenso por el Abismo de la Selva Alta',
        text: 'Oculta entre la vegetación exuberante de las estribaciones orientales de los Andes, en Morona Santiago, se abre una boca vertical de roca caliza que desciende decenas de metros hacia galerías monumentales de ángulos casi perfectos. Para las comunidades Shuar vecinas, la cueva es un recinto ceremonial de silencio donde habitan miles de tayos, aves nocturnas que navegan mediante ecolocalización.',
        illustrationPrompt: 'Vertical limestone cave entrance draped in rainforest vines with golden sunbeams piercing deep subterranean caverns.',
        illustrationStyle: 'Subterranean expedition realism',
        glossaryTerms: [
          { word: 'Tayo', language: 'Fauna amazónica', meaning: 'Ave frugívora nocturna (guácharo) que anida en cuevas profundas.', pronunciation: '[tá-yo]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: Las Cámaras Pétreas y la Memoria Antigua',
        text: 'Relatan los ancianos que expedicionarios llegados de tierras lejanas quedaron atónitos ante paredes lisas que parecían talladas por arquitectos invisibles y relatos sobre antiguas láminas grabadas con símbolos geométricos. Sin embargo, los guardianes Shuar recuerdan que el verdadero tesoro de la cueva no es el metal ni el oro, sino la armonía sagrada con la naturaleza que habita sus profundidades.',
        illustrationPrompt: 'Monumental geometric rock chamber deep underground illuminated by ceremonial torches.',
        illustrationStyle: 'Mystical archaeological fantasy',
        glossaryTerms: [
          { word: 'Uwishin', language: 'Shuar', meaning: 'Sabio sanador y guardián espiritual de la tradición amazónica.', pronunciation: '[u-wi-shín]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Pacto de Respeto Ecológico',
        text: 'Cada año, al ingresar únicamente en silencio y con autorización de la comunidad, los visitantes comprueban cómo los tayos emprenden su vuelo al atardecer para dispersar semillas por toda la selva, demostrando que la leyenda de la caverna sigue viva manteniendo el equilibrio del bosque.',
        illustrationPrompt: 'Hundreds of nocturnal tayo birds flying out of jungle cavern into starry twilight sky.',
        illustrationStyle: 'Radiant wildlife documentary painting',
        glossaryTerms: [
          { word: 'Morona Santiago', language: 'Geografía EC', meaning: 'Provincia amazónica ecuatoriana célebre por su biodiversidad y cultura Shuar.', pronunciation: '[mo-ró-na san-tiá-go]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Cueva de los Tayos: Catedrales bajo la Selva',
      durationSec: 44,
      synopsis: 'Relato amazónico sobre las cavernas sagradas de Morona Santiago y sus aves guardianas.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Bajo la selva de Morona Santiago se ocultan galerías de piedra tan antiguas como la memoria.',
          shuar: 'Morona nunkanam yaunchuk kaya waani pujawai.',
          en: 'Beneath the jungle of Morona Santiago lie stone galleries as old as memory.',
        },
        {
          timestampSec: 22,
          es: 'Cada noche, los tayos alzan vuelo sembrando nueva vida en el bosque.',
          shuar: 'Kashi chinki tayo nanamawartin ikiama nawantri.',
          en: 'Each night, the tayo birds take flight sowing new life across the forest.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué función ecológica cumplen los tayos que anidan en la cueva?',
        options: [
          'Salen de noche a alimentarse de frutos y dispersar semillas por la selva',
          'Viven bajo el agua salada del mar',
          'Construyen nidos únicamente en glaciares nevados',
        ],
        correctIndex: 0,
        explanation: 'Los tayos (guácharos) cumplen un papel esencial como dispersores de semillas en la selva alta amazónica.',
      },
      aiPromptUsed: 'Deep monumental stone cavern in Amazon rainforest with glowing sunbeams piercing from ceiling opening.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'mito-guacamayas-canari',
    category: 'mito',
    title: 'Las Guacamayas Sagradas y el Origen Cañari',
    culturalOrigin: 'Mito Fundacional de la Nación Cañari (Azuay y Cañar)',
    region: 'ecuador-sierra',
    coverImage: '🦜🏔️',
    readTimeMin: 7,
    isLockedForFree: false,
    summary:
      'El gran mito cosmogónico del Austro ecuatoriano: tras el diluvio universal, dos hermanos sobrevivientes en la cima del cerro Huacayñán fueron socorridos por guacamayas sagradas, dando origen al pueblo Cañari.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: El Gran Diluvio y la Cumbre de Huacayñán',
        text: 'En el tiempo primigenio, lluvias torrenciales inundaron los valles del Austro ecuatoriano durante días interminables. Dos hermanos lograron ascender hasta la cima sagrada del cerro Huacayñán ("Camino del Llanto"), cuya cumbre crecía milagrosamente a medida que subían las aguas para protegerlos del desastre.',
        illustrationPrompt: 'Two Andean brothers sheltering atop a sacred cloud-piercing mountain peak surrounded by vast floodwaters.',
        illustrationStyle: 'Andean mythic sacred mural',
        glossaryTerms: [
          { word: 'Huacayñán', language: 'Cañari / Kichwa', meaning: 'Montaña sagrada del refugio o "Camino del Llanto" en el Austro.', pronunciation: '[hua-cay-ñán]' },
          { word: 'Cañari', language: 'Nación ancestral', meaning: 'Histórico pueblo sabio de Azuay y Cañar, constructores de Ingapirca.', pronunciation: '[ca-ñá-ri]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: El Milagro de las Dos Guacamayas Celestiales',
        text: 'Cuando bajaron las aguas y los hermanos quedaron sin alimentos, regresaron hambrientos a su choza y hallaron un banquete servido con chicha tibia y viandas frescas de maíz. Al ocultarse para descubrir a sus benefactoras, vieron descender del cielo dos luminosas guacamayas de plumaje escarlata y turquesa que se transformaron en mujeres sabias.',
        illustrationPrompt: 'Two radiant scarlet-and-blue macaws landing beside a mountain stone hut bearing baskets of golden corn.',
        illustrationStyle: 'Luminous indigenous folklore realism',
        glossaryTerms: [
          { word: 'Kuri', language: 'Kichwa', meaning: 'Oro o brillo solar sagrado del plumaje ceremonial.', pronunciation: '[ku-ri]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Linaje Eterno del Austro',
        text: 'De la unión sagrada entre los sobrevivientes y las guacamayas celestiales nacieron las familias fundadoras de la nación Cañari. Por gratitud eterna, el pueblo Cañari venera a las guacamayas y a la serpiente primordial como emblemas sagrados de renacimiento, sabiduría y respeto por la naturaleza.',
        illustrationPrompt: 'Andean mountain valley blooming with terraced maize fields beneath rainbow and soaring macaws.',
        illustrationStyle: 'Vibrant heritage fresco',
        glossaryTerms: [
          { word: 'Ingapirca', language: 'Patrimonio EC', meaning: 'Gran complejo arqueológico astronómico edificado en territorio Cañari.', pronunciation: '[in-ga-pír-ca]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Huacayñán: El Regalo de las Guacamayas Sagradas',
      durationSec: 45,
      synopsis: 'Mito sagrado de origen del pueblo Cañari en el sur de los Andes ecuatorianos.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Sobre la cumbre de Huacayñán, dos hermanos sobrevivieron al gran diluvio.',
          kichwa: 'Huacayñán urkupi iskay wawki hatun yakumanta kispishka.',
          en: 'Atop Mount Huacayñán, two brothers survived the great primordial flood.',
        },
        {
          timestampSec: 22,
          es: 'Dos guacamayas luminosas sembraron la semilla eterna del pueblo Cañari.',
          kichwa: 'Iskay sumak wakamayu Cañari aylluta kallarichirkakuna.',
          en: 'Two radiant macaws planted the eternal seed of the Cañari nation.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué aves sagradas alimentaron y dieron origen al pueblo Cañari tras el diluvio?',
        options: ['Dos guacamayas sagradas', 'Dos pingüinos australes', 'Dos avestruces'],
        correctIndex: 0,
        explanation: 'Las guacamayas son el símbolo totémico fundamental del mito de origen Cañari en Azuay y Cañar.',
      },
      aiPromptUsed: 'Sacred scarlet macaws soaring over misty Andean peaks of Azuay and Cañar at golden sunrise.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'mito-posorja-vidente',
    category: 'mito',
    title: 'Posorja: La Profetisa de las Olas del Pacífico',
    culturalOrigin: 'Mito Ancestral Manteño-Huancavilca (Costa)',
    region: 'ecuador-costa',
    coverImage: '🐚🌊',
    readTimeMin: 6,
    isLockedForFree: true,
    summary:
      'El mito oceánico sobre la misteriosa joven Posorja, llegada en una embarcación tejida de espuma y nácar para anunciar a los pueblos navegantes del Pacífico el porvenir de su tierra.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: La Llegada en la Espuma de la Marea Alta',
        text: 'Cuentan los ancianos pescadores de la península de Santa Elena y la isla Puná que una mañana de neblina dorada arribó a la playa una pequeña embarcación de nácar sin remos ni velas. De ella descendió una joven serena de ojos profundos como el mar abierto, cubierta con collares de concha Spondylus roja.',
        illustrationPrompt: 'Luminous young coastal oracle stepping onto wet sand from a glowing mother-of-pearl vessel wearing red Spondylus shell necklaces.',
        illustrationStyle: 'Pacific coastal mythic watercolor',
        glossaryTerms: [
          { word: 'Spondylus (Mullu)', language: 'Cultura Manteño-Huancavilca', meaning: 'Concha marina roja considerada alimento sagrado de los dioses y símbolo de lluvia.', pronunciation: '[mu-llu]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: Los Presagios frente al Mar Abierto',
        text: 'Acogida con respeto por los sabios navegantes en balsas de vela triangular, Posorja anunció épocas de bonanza en la pesca, pero también profetizó la llegada futura de naves enormes venidas de horizontes lejanos que cambiarían para siempre la lengua y las ciudades del continente.',
        illustrationPrompt: 'Coastal community gathering around an oracle by flickering driftwood bonfires under ocean constellations.',
        illustrationStyle: 'Mystical maritime storytelling art',
        glossaryTerms: [
          { word: 'Balsa Manteña', language: 'Navegación ancestral', meaning: 'Balsa oceánica con velas triangulares capaz de navegar miles de kilómetros.', pronunciation: '[bál-sa man-té-ña]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: El Regreso al Horizonte Azul',
        text: 'Cumplida su palabra sagrada, Posorja caminó lentamente hacia las olas plateadas al atardecer y desapareció entre la brisa salina dejando su nombre grabado para siempre en el puerto marítimo ecuatoriano que honra su memoria.',
        illustrationPrompt: 'Golden sunset horizon over Pacific waves where glowing seafoam fades into twilight stars.',
        illustrationStyle: 'Poetic oceanic realism',
        glossaryTerms: [
          { word: 'Posorja', language: 'Toponimia costera', meaning: 'Histórica parroquia marítima y símbolo mítico de la costa del Guayas.', pronunciation: '[po-sór-ja]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Posorja: Oráculo del Mullu Sagrado',
      durationSec: 40,
      synopsis: 'Mito marítimo sobre la vidente llegada del océano Pacífico y el valor sagrado de la concha Spondylus.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Entre espuma marina y conchas rojas de Mullu arribó Posorja a la costa.',
          en: 'Amidst seafoam and red Mullu shells, Posorja arrived upon the coast.',
        },
        {
          timestampSec: 20,
          es: 'Sus profecías aún resuenan en el viento de los navegantes del Pacífico.',
          en: 'Her prophecies still echo in the winds of Pacific navigators.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué concha marina sagrada simbolizaba la conexión espiritual con el mar y la lluvia?',
        options: [
          'La concha roja Spondylus (Mullu)',
          'El caracol de río dulce',
          'La piedra volcánica negra',
        ],
        correctIndex: 0,
        explanation: 'El Mullu o Spondylus fue venerado desde los Andes hasta la costa del Pacífico como símbolo sagrado de agua y fertilidad.',
      },
      aiPromptUsed: 'Pacific coast of Ecuador at twilight with ancient balsa sail raft and glowing red Spondylus shells.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'mito-tsunki-shuar',
    category: 'mito',
    title: 'Tsunki y el Espíritu de las Aguas Amazónicas',
    culturalOrigin: 'Mito Cosmogónico Shuar de los Ríos (Amazonía)',
    region: 'ecuador-oriente',
    coverImage: '🐍💧',
    readTimeMin: 7,
    isLockedForFree: true,
    summary:
      'El mito sagrado de Tsunki, la deidad benévola de los ríos amazónicos que enseñó a los primeros chamanes (uwishin) el poder de sanar y el respeto por la vida acuática.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: Los Palacios Cristalinos bajo el Río Zamora',
        text: 'En las profundidades tranquilas de los grandes ríos amazónicos como el Zamora y el Upano habita Tsunki, espíritu primordial del mundo acuático. En su morada subacuática, las anacondas descansan como bancos de asiento y los peces luminosos iluminan grutas de cristal líquido donde jamás entra la codicia.',
        illustrationPrompt: 'Bioluminescent underwater river palace in the Amazon filled with crystal currents and peaceful sacred fish.',
        illustrationStyle: 'Amazonian aquatic dreamscape',
        glossaryTerms: [
          { word: 'Tsunki', language: 'Shuar', meaning: 'Espíritu supremo de las aguas fluviales y fuente de poder curativo.', pronunciation: '[tsún-ki]' },
          { word: 'Entsa', language: 'Shuar', meaning: 'Agua pura de río que transporta energía vital y purificación.', pronunciation: '[én-tsa]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: El Don de la Sanación para el Uwishin',
        text: 'Cuenta el mito que un cazador respetuoso que jamás contaminaba el río auxilió a una criatura herida sin saber que pertenecía al linaje de Tsunki. En agradecimiento, el espíritu de las aguas le confió el conocimiento secreto de las plantas medicinales y la fuerza espiritual (tsentsak) para curar enfermedades de la comunidad.',
        illustrationPrompt: 'Wise Amazonian healer receiving luminous medicinal forest herbs beside a glowing waterfall at dawn.',
        illustrationStyle: 'Spiritual Amazonian painting',
        glossaryTerms: [
          { word: 'Nampet', language: 'Shuar', meaning: 'Canto alegre comunitario celebrado en honor a la vida compartida.', pronunciation: '[nam-pet]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: La Custodia de los Ríos Vivos',
        text: 'Tsunki advirtió que su bendición permanece únicamente mientras los pueblos cuiden la pureza de las vertientes, eviten la pesca destructiva y honren a los ríos como arterias vivas de la tierra. Así, cada cascada amazónica sigue siendo un altar de renovación espiritual.',
        illustrationPrompt: 'Pristine emerald-free turquoise Amazonian waterfall surrounded by lush ferns and sunlit mist.',
        illustrationStyle: 'Radiant rainforest conservation art',
        glossaryTerms: [
          { word: 'Shuar', language: 'Autodenominación', meaning: 'Significa "Personas / Gente" en idioma Chicham.', pronunciation: '[shú-ar]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Tsunki: Guardianes del Agua Viva',
      durationSec: 43,
      synopsis: 'Cosmovisión amazónica Shuar sobre la sacralidad de los ríos y la medicina tradicional.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Bajo las corrientes del Upano y Zamora reposa la sabiduría ancestral de Tsunki.',
          shuar: 'Entsa initik Tsunki kakaram uwishin unuimiakma.',
          en: 'Beneath the currents of the Upano and Zamora rests the ancestral wisdom of Tsunki.',
        },
        {
          timestampSec: 21,
          es: 'Quien cuida el río recibe salud, vida y armonía para toda su familia.',
          shuar: 'Entsa wainkiatin penker pujutai susamuiti.',
          en: 'Whoever protects the river receives health, life, and harmony for their family.',
        },
      ],
      triviaQuestion: {
        question: '¿Qué enseñanza central transmite el mito de Tsunki en la cultura Shuar?',
        options: [
          'El respeto sagrado por la pureza de los ríos y el origen de la medicina tradicional',
          'La construcción de represas industriales gigantes',
          'Evitar navegar por todos los ríos',
        ],
        correctIndex: 0,
        explanation: 'Tsunki representa la sacralidad del agua viva y la responsabilidad ética con la naturaleza amazónica.',
      },
      aiPromptUsed: 'Bioluminescent Amazonian waterfall and clear river cave glowing softly at sunrise.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
  {
    id: 'mito-quetzalcoatl-maiz',
    category: 'mito',
    title: 'Quetzalcóatl y la Montaña del Maíz Sagrado',
    culturalOrigin: 'Mito Cosmogónico Mesoamericano (Tradición Nahua)',
    region: 'internacional',
    coverImage: '🌽🐍',
    readTimeMin: 7,
    isLockedForFree: true,
    summary:
      'El célebre mito de América antigua sobre cómo la Serpiente Emplumada se transformó en una diminuta hormiga negra para rescatar el grano de maíz del interior de la montaña Tonacatépetl.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I: La Búsqueda del Alimento para la Humanidad',
        text: 'Tras la creación de los primeros seres humanos en Mesoamérica, los dioses buscaron un alimento digno capaz de nutrir el cuerpo y el espíritu de los pueblos. Solo la hormiga roja conocía un secreto guardado celosamente dentro de la impenetrable montaña Tonacatépetl ("Cerro de Nuestro Sustento").',
        illustrationPrompt: 'Feathered serpent deity gazing at a towering sacred stone mountain bathed in golden Mesoamerican clouds.',
        illustrationStyle: 'Pre-Hispanic codex inspired luminous mural',
        glossaryTerms: [
          { word: 'Tonacatépetl', language: 'Náhuatl', meaning: 'Montaña sagrada de los mantenimientos donde se ocultaban las semillas.', pronunciation: '[to-na-ca-té-petl]' },
          { word: 'Quetzalcóatl', language: 'Náhuatl', meaning: 'Serpiente Emplumada, símbolo de sabiduría, viento y civilización.', pronunciation: '[quet-zal-có-atl]' },
        ],
      },
      {
        scene: 2,
        title: 'Capítulo II: La Metamorfosis en Hormiga Negra',
        text: 'Lejos de usar la violencia contra la roca, el sabio Quetzalcóatl comprendió que la humildad supera a la fuerza bruta. Se transformó en una pequeña hormiga negra, siguió los estrechos túneles subterráneos y cargó con esfuerzo sobre su espalda un único grano dorado de maíz hasta devolverlo a la luz del sol.',
        illustrationPrompt: 'Tiny dark ant carrying a radiant glowing golden kernel of maize through a narrow stone crevice.',
        illustrationStyle: 'Mythological detail illustration',
        glossaryTerms: [
          { word: 'Cintli / Sara', language: 'Náhuatl / Kichwa', meaning: 'Maíz sagrado, pilar alimentario común de todas las civilizaciones de América.', pronunciation: '[cín-tli / sá-ra]' },
        ],
      },
      {
        scene: 3,
        title: 'Capítulo III: La Milpa y la Hermandad Continental',
        text: 'Al compartir el grano con los pueblos, nacieron la milpa en México y las chakras de maíz en los Andes, demostrando la profunda conexión cultural entre las grandes tradiciones originarias de América.',
        illustrationPrompt: 'Golden maize fields flourishing across terraced valleys uniting northern and southern Indigenous heritage.',
        illustrationStyle: 'Golden mural art',
        glossaryTerms: [
          { word: 'Milpa', language: 'Náhuatl', meaning: 'Sistema agrícola tradicional en armonía entre maíz, fréjol y calabaza.', pronunciation: '[míl-pa]' },
        ],
      },
    ],
    videoExperience: {
      videoTitle: 'Quetzalcóatl: El Regalo Dorado del Maíz',
      durationSec: 42,
      synopsis: 'Mito americano sobre cómo la humildad y la inteligencia entregaron el maíz a los pueblos.',
      subtitles: [
        {
          timestampSec: 0,
          es: 'Dentro de la montaña sagrada reposaba el grano que daría vida a América.',
          en: 'Inside the sacred mountain rested the grain that would nourish the Americas.',
        },
        {
          timestampSec: 21,
          es: 'Transformado en pequeña hormiga, Quetzalcóatl rescató el maíz para toda la humanidad.',
          en: 'Transformed into a tiny ant, Quetzalcóatl rescued maize for all humanity.',
        },
      ],
      triviaQuestion: {
        question: '¿En qué se transformó Quetzalcóatl para entrar en la montaña Tonacatépetl?',
        options: [
          'En una pequeña hormiga negra',
          'En un león marino',
          'En un caballo alado de acero',
        ],
        correctIndex: 0,
        explanation: 'Su transformación en hormiga negra simboliza que la humildad y la astucia logran abrir caminos cerrados a la fuerza.',
      },
      aiPromptUsed: 'Sacred Mesoamerican mountain bathed in sunrise mist with golden maize kernels and feathered serpent motif.',
      aiModelUsed: 'Gemini Imagen / Veo Video Pipeline (AI Studio Engine)',
    },
  },
];
