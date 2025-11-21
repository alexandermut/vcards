import { parseImpressumToVCard } from './regexParser';
import { parseVCardString, generateVCardFromData } from './vcardUtils';
import { DEFAULT_VCARD } from './vcardUtils';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ ${message}`);
  }
};

export const runSelfTests = () => {
  console.group('🚀 Running Self-Tests...');
  let passed = 0;
  let total = 0;

  try {
    // --- TEST 1: Regex Parser Basic ---
    total++;
    const text1 = `
      Max Mustermann
      Musterfirma GmbH
      Musterstraße 1
      12345 Musterstadt
      Tel: +49 30 1234567
    `;
    const vcard1 = parseImpressumToVCard(text1);
    assert(vcard1.includes('FN;CHARSET=utf-8:Max Mustermann'), 'Regex: Finds Full Name');
    assert(vcard1.includes('ORG;CHARSET=utf-8:Musterfirma GmbH'), 'Regex: Finds Company');
    assert(vcard1.includes('TEL;CHARSET=utf-8;TYPE=WORK,VOICE:+49 30 1234567'), 'Regex: Finds Phone');
    passed++;

    // --- TEST 2: Regex Parser Company Fallback (First Line) ---
    total++;
    const text2 = `
      Hidden Champion Inc.
      John Doe
      Somestreet 1
    `;
    const vcard2 = parseImpressumToVCard(text2);
    assert(vcard2.includes('ORG;CHARSET=utf-8:Hidden Champion Inc.'), 'Regex: Finds Company on first line (Fallback)');
    assert(vcard2.includes('FN;CHARSET=utf-8:John Doe'), 'Regex: Finds Name below company');
    passed++;

    // --- TEST 3: Country Detection ---
    total++;
    const text3 = `
      Hans Müller
      Hauptstr. 5
      CH-8001 Zürich
    `;
    const vcard3 = parseImpressumToVCard(text3);
    assert(vcard3.includes(';Zürich;;8001;Schweiz'), 'Regex: Detects Switzerland (CH-)');
    passed++;

    // --- TEST 4: Roundtrip Integrity (String -> Data -> String) ---
    total++;
    const original = DEFAULT_VCARD;
    const parsed1 = parseVCardString(original);
    const generated1 = generateVCardFromData(parsed1.data);
    const parsed2 = parseVCardString(generated1);
    
    // Compare critical data points
    assert(parsed1.data.fn === parsed2.data.fn, 'Roundtrip: FN preserved');
    assert(parsed1.data.org === parsed2.data.org, 'Roundtrip: ORG preserved');
    assert(JSON.stringify(parsed1.data.tel) === JSON.stringify(parsed2.data.tel), 'Roundtrip: TEL preserved');
    
    // Check Address Structure Integrity
    const adr1 = parsed1.data.adr?.[0]?.value;
    const adr2 = parsed2.data.adr?.[0]?.value;
    if (adr1 && adr2) {
        assert(adr1.street === adr2.street, 'Roundtrip: Address Street preserved');
        assert(adr1.zip === adr2.zip, 'Roundtrip: Address ZIP preserved');
        assert(adr1.city === adr2.city, 'Roundtrip: Address City preserved');
    }
    passed++;

    console.log(`🎉 All Tests Passed (${passed}/${total})`);

  } catch (e) {
    console.error('Test Suite Failed', e);
  }
  console.groupEnd();
};