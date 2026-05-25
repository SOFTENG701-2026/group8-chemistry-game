export type MoleculeFacts = {
  1: string;
  2: string;
  3: string;
};

export const FUN_FACTS: Record<string, MoleculeFacts> = {
  'Methane': {
    1: 'Methane is the main component of natural gas and is also produced by cows — a single cow can belch up to 100 kg of methane per year.',
    2: 'Methane has a perfect tetrahedral shape with bond angles of 109.5°, making it the textbook example of sp³ hybridisation.',
    3: 'Methane was first scientifically identified by Alessandro Volta in 1776, who collected it from marsh gas bubbling up in Lake Maggiore, Italy.',
  },
  'Ethane': {
    1: 'Ethane is the second-largest component of natural gas and is cracked industrially to produce ethylene, the world\'s most-produced organic compound.',
    2: 'The C–C bond in ethane can rotate freely, giving rise to staggered and eclipsed conformations — a key concept in conformational analysis.',
    3: 'Michael Faraday first synthesised ethane in 1834 by electrolyzing acetate solutions, a reaction later named the Kolbe electrolysis.',
  },
  'Propane': {
    1: 'Propane was first identified in 1857 by Marcellin Berthelot, but it wasn\'t used as a commercial fuel until 1910 when Walter Snelling figured out how to liquefy it.',
    2: 'Propane has an anti and a gauche conformation around its central C–C bond, making it the simplest alkane to demonstrate rotational isomerism.',
    3: 'During World War II, propane became a critical fuel because it could be transported as a liquid without the heavy infrastructure gasoline required.',
  },
  'Butane': {
    1: 'Butane powers most disposable cigarette lighters. At room temperature it\'s a gas, but a tiny bit of pressure keeps it liquid inside the lighter.',
    2: 'Butane is the simplest alkane with a structural isomer: its branched form, 2-methylpropane, has the same formula C₄H₁₀ but a different shape and boiling point.',
    3: 'Edward Frankland first reported butane in 1849 while studying organozinc compounds, making it one of the earliest organic molecules deliberately synthesised.',
  },
  'Methanol': {
    1: 'Methanol is the simplest alcohol and is extremely toxic — as little as 10 mL can cause permanent blindness. It\'s used as racing fuel in drag cars and Indianapolis-type races.',
    2: 'Methanol\'s boiling point (64.7 °C) is much higher than expected for its molecular weight because of strong O–H hydrogen bonding between molecules.',
    3: 'Methanol was historically called "wood alcohol" because it was first obtained by the destructive distillation of wood by Robert Boyle in 1661.',
  },
  'Ethanol': {
    1: 'Ethanol has been brewed by humans for over 9,000 years. Beyond beverages, it\'s used as a biofuel — Brazil runs about 30% of its cars on pure ethanol.',
    2: 'Ethanol is completely miscible with water because its hydroxyl group forms strong hydrogen bonds, but its two-carbon chain also gives it some non-polar character.',
    3: 'Ancient Egyptians used ethanol distillation for perfumes as early as 3000 BCE, and the word "alcohol" comes from the Arabic "al-kuḥl," meaning a fine powder or essence.',
  },
  'Propan-1-ol': {
    1: 'Propan-1-ol is used in the pharmaceutical industry as a solvent for resins and cellulose esters, and it\'s an intermediate in the production of propionic acid.',
    2: 'Propan-1-ol and propan-2-ol are positional isomers — the –OH on carbon 1 vs carbon 2 gives them different boiling points, reactivity, and NMR spectra.',
    3: 'Propan-1-ol was first prepared in 1853 by Chancel through the reduction of propionic acid, establishing early methods of functional group interconversion.',
  },
  'Ethene': {
    1: 'Ethene (ethylene) is a natural plant hormone that triggers fruit ripening. Commercially, bananas are shipped green and then gassed with ethylene to ripen on demand.',
    2: 'The double bond in ethene consists of one σ bond and one π bond, and it locks the molecule flat — all six atoms lie in the same plane.',
    3: 'In 1795, Dutch chemists made ethylene dichloride from ethene, calling it "olefiant gas" (oil-making gas) — the root of the term "olefin" still used today.',
  },
  'Propene': {
    1: 'Propene (propylene) is the starting material for polypropylene, one of the most versatile plastics — found in everything from yogurt containers to car bumpers.',
    2: 'The methyl group next to propene\'s double bond is "allylic," giving those C–H bonds lower dissociation energy and making them unusually reactive in radical reactions.',
    3: 'The Ziegler-Natta catalyst, which earned a Nobel Prize in 1963, made it possible to polymerise propene into isotactic polypropylene — transforming the plastics industry.',
  },
  'Chloroethane': {
    1: 'Chloroethane was once widely used as a spray-on anaesthetic for minor sports injuries because it rapidly evaporates and numbs the skin by cooling.',
    2: 'Chloroethane undergoes SN2 substitution easily because the primary carbon bearing the chlorine is not sterically hindered.',
    3: 'Chloroethane was one of the first chemicals used as a general anaesthetic in dental surgery during the 1850s, before safer alternatives like diethyl ether took over.',
  },
  'Ethanoic Acid': {
    1: 'Ethanoic acid is better known as acetic acid — the sharp tang in vinegar. The word "acid" itself traces back to the Latin "acetum" meaning vinegar.',
    2: 'Ethanoic acid forms dimers through hydrogen bonding — two molecules pair up head-to-tail, which is why its boiling point (118 °C) is higher than you\'d expect.',
    3: 'Vinegar has been made since ancient Babylon (around 5000 BCE). The bacterium Acetobacter converts ethanol to acetic acid, making vinegar a two-stage fermentation product.',
  },
  'Propanoic Acid': {
    1: 'Propanoic acid and its calcium salt are commonly added to bread and baked goods as a preservative (E282) to inhibit mould growth.',
    2: 'Propanoic acid\'s pKa of 4.87 is very close to ethanoic acid\'s 4.76 — the extra CH₂ group has only a tiny electron-donating effect on acidity.',
    3: 'Johann Gottlieb first synthesised propanoic acid in 1844 from sugar degradation. Its name comes from the Greek "protos" (first) and "pion" (fat), meaning "first fat."',
  },
  'Ethanamine': {
    1: 'Ethanamine has a strong fishy, ammonia-like smell and is partly responsible for the odour of decomposing fish. It\'s also used in making dyes and medicines.',
    2: 'Ethanamine is a stronger base than ammonia because the ethyl group donates electron density to the nitrogen, increasing its ability to accept a proton.',
    3: 'Charles Adolphe Wurtz first prepared ethanamine in 1849 by reducing acetonitrile, establishing a classic method for synthesising primary amines.',
  },
  'Propan-1-amine': {
    1: 'Propan-1-amine is used as an intermediate in synthesising pesticides and pharmaceuticals, and it\'s a building block for rubber accelerators in tyre manufacturing.',
    2: 'Propan-1-amine can form up to two hydrogen bonds per molecule (N–H···N), giving it a boiling point of 48 °C — much higher than propane\'s −42 °C.',
    3: 'Propan-1-amine belongs to the class of compounds that August Wilhelm von Hofmann systematically studied in the 1850s, leading to his amine classification system still taught today.',
  },
  '2-methylpropane': {
    1: '2-methylpropane (isobutane) is used as a refrigerant (R-600a) in household fridges across Europe and Asia because it has a very low global-warming potential.',
    2: '2-methylpropane boils at −11.7 °C, about 12 °C lower than butane (−0.5 °C), because its compact, spherical shape reduces surface area and London dispersion forces.',
    3: 'The structural isomerism between butane and 2-methylpropane was one of the first experimental confirmations of August Kekulé\'s theory of carbon valence in the 1860s.',
  },
  'Propan-2-ol': {
    1: 'Propan-2-ol is the "rubbing alcohol" in medicine cabinets. During COVID-19, WHO recommended 75% isopropanol solutions as an effective hand sanitiser.',
    2: 'As a secondary alcohol, propan-2-ol oxidises to propanone (acetone) rather than an aldehyde, making it a textbook example of how alcohol class determines oxidation product.',
    3: 'Propan-2-ol was the first commercial petrochemical: Standard Oil patented its synthesis by hydrating propene with sulfuric acid in 1920.',
  },
  'Butan-2-ol': {
    1: 'Butan-2-ol is one of the simplest chiral molecules — it has a carbon bonded to four different groups, making it exist as two mirror-image forms.',
    2: 'Butan-2-ol\'s chiral centre at C-2 means its two enantiomers rotate plane-polarised light in opposite directions, a property measurable with a polarimeter.',
    3: 'Louis Pasteur\'s 1848 work on tartaric acid crystals laid the foundation for understanding chirality — butan-2-ol is now a standard introductory example of that concept.',
  },
  '1-chloropropane': {
    1: '1-chloropropane is used as a chemical intermediate and solvent. Its boiling point (46 °C) is close to body temperature, so it evaporates quickly on skin.',
    2: '1-chloropropane reacts via the SN2 mechanism because the chlorine sits on a primary carbon with minimal steric hindrance, allowing backside nucleophilic attack.',
    3: 'Alexander William Williamson\'s work on ether synthesis in the 1850s used haloalkanes like 1-chloropropane, helping establish the concept of reaction mechanisms in organic chemistry.',
  },
  '2-chloropropane': {
    1: '2-chloropropane reacts much faster in substitution reactions than its 1-chloro isomer because it forms a more stable secondary carbocation — a textbook example in organic chemistry.',
    2: 'When 2-chloropropane undergoes elimination with a strong base, it produces propene — a classic example of an E2 reaction with Zaitsev\'s rule selecting the more substituted alkene.',
    3: 'Christopher Ingold\'s groundbreaking 1930s mechanistic studies used haloalkanes like 2-chloropropane to define the SN1 and SN2 classification still central to organic chemistry.',
  },
  'But-2-ene': {
    1: 'But-2-ene exists as two geometric isomers — cis and trans — making it a classic teaching example of E/Z isomerism around a double bond.',
    2: 'The π bond in but-2-ene prevents rotation, locking the two methyl groups either on the same side (cis, bp 4 °C) or opposite sides (trans, bp 1 °C).',
    3: 'Jacobus van\'t Hoff proposed the tetrahedral carbon in 1874, which explained why molecules like but-2-ene can exist as geometric isomers — a radical idea at the time.',
  },
  'Methyl ethanoate': {
    1: 'Methyl ethanoate (methyl acetate) is one of the main solvents in nail polish remover and has a pleasant fruity smell reminiscent of certain glues.',
    2: 'Methyl ethanoate is formed by a condensation reaction between methanol and ethanoic acid, releasing water — a textbook example of esterification with an acid catalyst.',
    3: 'Emil Fischer\'s esterification studies in the 1890s established the acid-catalysed mechanism for making esters like methyl ethanoate, work that contributed to his 1902 Nobel Prize.',
  },
  'Ethyl ethanoate': {
    1: 'Ethyl ethanoate (ethyl acetate) gives nail polish remover its characteristic sweet smell. It\'s also the fruity aroma in many wines and is approved as a food flavouring.',
    2: 'Ethyl ethanoate\'s ester bond can be broken by water (hydrolysis) in either acidic or basic conditions — base hydrolysis is irreversible and is called saponification.',
    3: 'The large-scale production of ethyl ethanoate via the Tishchenko reaction (using an aluminium alkoxide catalyst) was developed in the early 1900s and is still used industrially.',
  },
  'Propyl methanoate': {
    1: 'Propyl methanoate smells like rum and plums. It\'s used as a food-grade flavouring agent to give artificial fruit flavours to sweets and beverages.',
    2: 'Propyl methanoate hydrolyses more easily than most esters because the hydrogen on the methanoyl (formyl) group provides less steric shielding of the carbonyl carbon.',
    3: 'Artificial flavourings like propyl methanoate became widespread in the 1860s when industrial chemistry made synthetic esters cheaper than extracting from natural sources.',
  },
  'Butyl ethanoate': {
    1: 'Butyl ethanoate is responsible for the smell of red apples and is added to confectionery and perfumes. It\'s also used as a solvent in lacquers and paints.',
    2: 'The four-carbon butyl chain makes butyl ethanoate less water-soluble than shorter esters — a trend caused by increasing hydrophobic character as the carbon chain grows.',
    3: 'The industrial synthesis of butyl ethanoate expanded rapidly in the 1920s when it became a key solvent for nitrocellulose lacquers used in the booming automobile paint industry.',
  },
  'Propanamide': {
    1: 'Propanamide is an example of how adding an amide group dramatically raises boiling point — strong hydrogen bonding gives it a boiling point of 213 °C despite its small size.',
    2: 'The amide C–N bond in propanamide has partial double-bond character due to resonance, which restricts rotation and keeps the nitrogen\'s lone pair delocalised into the carbonyl.',
    3: 'The discovery that amide bonds are the same linkage that connects amino acids in proteins was pivotal to understanding protein structure in the early 1900s.',
  },
  'Ethanoyl chloride': {
    1: 'Ethanoyl chloride (acetyl chloride) is so reactive with water that it fumes in moist air, making it a go-to reagent for introducing acetyl groups in organic synthesis.',
    2: 'Ethanoyl chloride\'s extreme reactivity comes from chlorine being a good leaving group and the carbonyl carbon being highly electrophilic — it reacts with water, alcohols, and amines instantly.',
    3: 'Charles Gerhardt first prepared ethanoyl chloride in 1852 while researching acid anhydrides, pioneering the study of acyl substitution chemistry.',
  },
  'Ethan-1,2-diol': {
    1: 'Ethan-1,2-diol is the main ingredient in most car antifreeze. It lowers the freezing point of water to about −37 °C and has a dangerously sweet taste.',
    2: 'Both –OH groups in ethan-1,2-diol can form hydrogen bonds simultaneously, giving it an unusually high boiling point (197 °C) and complete miscibility with water.',
    3: 'Charles Adolphe Wurtz first synthesised ethan-1,2-diol in 1856 by hydrating ethylene oxide, a reaction that remains the primary industrial route today.',
  },
  '2-chloro-2-methylpropane': {
    1: '2-chloro-2-methylpropane (tert-butyl chloride) is the textbook example of an SN1 reaction — it ionises so readily that it reacts almost instantly with water.',
    2: 'The tertiary carbocation formed from 2-chloro-2-methylpropane is stabilised by hyperconjugation from nine adjacent C–H bonds donating electron density into the empty p orbital.',
    3: 'Hughes and Ingold used 2-chloro-2-methylpropane in their landmark 1935 kinetics experiments that defined the SN1 mechanism and established physical organic chemistry as a field.',
  },
  '2-hydroxypropanoic acid (Lactic Acid)': {
    1: 'Lactic acid builds up in your muscles during intense exercise, causing the "burn." It was first isolated in 1780 by Carl Wilhelm Scheele from sour milk.',
    2: 'Lactic acid is both an alcohol and a carboxylic acid (an α-hydroxy acid). Its chiral centre means living organisms produce only the L-form, while industrial synthesis gives a racemic mix.',
    3: 'Carl Wilhelm Scheele isolated lactic acid from sour milk in 1780, but it wasn\'t until 1881 that Pasteur showed specific bacteria were responsible for its production.',
  },
  'Glycine (Amino Acid)': {
    1: 'Glycine is the simplest amino acid and the only one that isn\'t chiral. It has been detected in comet dust, suggesting amino acids may have extraterrestrial origins.',
    2: 'Glycine exists as a zwitterion at physiological pH: its amino group gains a proton (NH₃⁺) while its carboxyl group loses one (COO⁻), giving it a high melting point for its size.',
    3: 'Henri Braconnot first isolated glycine in 1820 by hydrolysing gelatin with sulfuric acid, naming it after the Greek word "glykys" meaning sweet, for its taste.',
  },
};
