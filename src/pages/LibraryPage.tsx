import React, { useState, useEffect } from 'react';
import {
  CipherType,
  cipherInfo,
  CipherData,
  CipherConfig,
  CipherExample,
} from '../types';
import CipherSelector from '../components/cipher/CipherSelector';
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Label from '../components/ui/Label';
import {
  BookOpenText,
  History,
  Lightbulb,
  Wand2,
  KeyRound,
  HelpCircle,
  Info,
  LockKeyhole,
  ScrollText,
  Brain,
} from 'lucide-react';
import { encryptText, decryptText } from '../lib/cipherUtils';

const detailedCipherData: Record<CipherType, Partial<CipherData>> = {
  caesar: {
    history:
      "Named after Julius Caesar, who used it in his private correspondence. It's one of the simplest and most widely known encryption techniques.",
    example: { original: 'HELLO WORLD', key: 3, encrypted: 'KHOOR ZRUOG' },
    tips: 'Try common shifts like 3 or 13 (ROT13). Look for frequent letters in the ciphertext that might correspond to E, T, A, O, I, N, S, H, R.',
  },
  atbash: {
    history:
      'A simple substitution cipher originally used for the Hebrew alphabet. It reverses the alphabet (A becomes Z, B becomes Y, etc.).',
    example: { original: 'CIPHER', encrypted: 'XRIKSV' },
    tips: 'If you suspect Atbash, simply apply the reverse alphabet mapping to the ciphertext.',
  },
  substitution: {
    history:
      "A method of encryption by which units of plaintext are replaced with ciphertext, according to a fixed system. The 'units' may be single letters, pairs of letters, etc.",
    example: {
      original: 'SECRET MESSAGE',
      key: 'QWERTYUIOPASDFGHJKLZXCVBNM',
      encrypted: 'CTZDTK ATJJQLT',
    },
    tips: 'Frequency analysis is key. Identify common letters in the ciphertext and try to map them to common English letters (E, T, A, O).',
  },
  transposition: {
    history:
      'Rearranges the letters of the plaintext without changing the letters themselves. Columnar transposition is a common form.',
    example: {
      original: 'MEET ME AT THE PARK',
      key: 4,
      encrypted: 'MMTAEEHREMET KTP',
    },
    tips: 'Look for unusual letter combinations or anagrams. Try rearranging letters into grids of different column counts.',
  },
  anagram: {
    history:
      'A word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
    example: { original: 'LISTEN', encrypted: 'SILENT' },
    tips: 'Consider common words, themes of the hunt. Sometimes a clue will hint at the number of words or letters.',
  },
  mirror: {
    history:
      'Writing that is reversed, appearing normal when viewed in a mirror. Leonardo da Vinci famously used mirror writing.',
    example: { original: 'REFLECT', encrypted: 'TCELFER' },
    tips: 'If the text looks like gibberish but has familiar letter shapes, try reading it backwards or holding it up to a mirror.',
  },
  riddle: {
    history:
      'A question or statement phrased in a deliberately puzzling way, requiring ingenuity in ascertaining its answer or meaning.',
    example: {
      original: 'What has an eye, but cannot see?',
      encrypted: 'A NEEDLE',
    },
    tips: 'Think laterally! Riddles often rely on wordplay, metaphors, and unexpected interpretations.',
  },
  binary: {
    history:
      'Represents text, computer processor instructions, or any other data using a two-symbol system (0 and 1).',
    example: { original: 'HI', encrypted: '01001000 01001001' },
    tips: 'Look for sequences of 0s and 1s, often in groups of 7 or 8 (for ASCII). Online converters are helpful.',
  },
  morse: {
    history:
      'A method used in telecommunication to encode text characters as standardized sequences of two different signal durations, called dots and dashes.',
    example: { original: 'SOS', encrypted: '... --- ...' },
    tips: 'Identify patterns of dots (.) and dashes (-). Use a Morse code chart for translation.',
  },
};

const cipherIcons: Record<CipherType, React.ReactElement> = {
  caesar: <LockKeyhole />,
  atbash: <LockKeyhole />,
  substitution: <LockKeyhole />,
  transposition: <LockKeyhole />,
  anagram: <Brain />,
  mirror: <LockKeyhole />,
  riddle: <Brain />,
  binary: <ScrollText />,
  morse: <ScrollText />,
};

const LibraryPage: React.FC = () => {
  const [selectedCipherType, setSelectedCipherType] =
    useState<CipherType | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [keyOrConfig, setKeyOrConfig] = useState<CipherConfig>({});

  const selectedCipherInfo = selectedCipherType
    ? cipherInfo[selectedCipherType]
    : null;
  const selectedDetailedData = selectedCipherType
    ? detailedCipherData[selectedCipherType]
    : null;

  const handleCipherSelect = (cipherType: CipherType) => {
    setSelectedCipherType(cipherType);
    setInputText('');
    setOutputText('');
    const example = detailedCipherData[cipherType]?.example;
    const initialConfig: CipherConfig = {};

    if (example?.key !== undefined) {
      if (cipherType === 'caesar') {
        initialConfig.shift = Number(example.key);
      } else if (cipherType === 'transposition') {
        initialConfig.key = Number(example.key);
      } else {
        initialConfig.key = String(example.key);
      }
    } else {
      if (cipherType === 'caesar') initialConfig.shift = 3;
      if (cipherType === 'transposition') initialConfig.key = 5;
    }
    setKeyOrConfig(initialConfig);
  };

  useEffect(() => {
    if (selectedCipherType) {
      const example = detailedCipherData[selectedCipherType]?.example;
      const newConfig: CipherConfig = {};
      if (example?.key !== undefined) {
        if (selectedCipherType === 'caesar') {
          newConfig.shift = Number(example.key);
        } else if (selectedCipherType === 'transposition') {
          newConfig.key = Number(example.key);
        } else {
          newConfig.key = String(example.key);
        }
      } else {
        if (selectedCipherType === 'caesar') newConfig.shift = 3;
        if (selectedCipherType === 'transposition') newConfig.key = 5;
      }
      setKeyOrConfig(newConfig);
    } else {
      setKeyOrConfig({});
    }
  }, [selectedCipherType]);

  const handleEncryptionDecryption = (mode: 'encrypt' | 'decrypt') => {
    if (!selectedCipherType || !inputText) {
      setOutputText('Please select a cipher and enter text to transform.');
      return;
    }

    if (selectedCipherType === 'riddle') {
      setOutputText(
        'Riddles are not meant to be encrypted or decrypted. Instead, focus on solving the riddle through careful thought and lateral thinking.'
      );
      return;
    }

    try {
      const currentConfig: CipherConfig = { ...keyOrConfig };
      if (selectedCipherType === 'caesar' && keyOrConfig.shift !== undefined) {
        currentConfig.shift = Number(keyOrConfig.shift);
      }
      if (
        selectedCipherType === 'transposition' &&
        keyOrConfig.key !== undefined &&
        typeof keyOrConfig.key === 'number'
      ) {
        currentConfig.key = keyOrConfig.key;
      }
      if (
        selectedCipherType === 'substitution' &&
        typeof keyOrConfig.key === 'string'
      ) {
        currentConfig.key = keyOrConfig.key;
      }
      if (
        selectedCipherType === 'mirror' &&
        typeof keyOrConfig.advanced === 'boolean'
      ) {
        currentConfig.advanced = keyOrConfig.advanced;
      }

      const result =
        mode === 'encrypt'
          ? encryptText(inputText, selectedCipherType, currentConfig)
          : decryptText(inputText, selectedCipherType, currentConfig);
      setOutputText(result);
    } catch (error) {
      console.error(`Error during ${mode}:`, error);
      setOutputText(
        error instanceof Error ? error.message : `Failed to ${mode}.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 py-12 font-sans">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <BookOpenText className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 font-serif tracking-tight">
            The Cipher Library
          </h1>
          <p className="text-lg text-slate-600 mt-3 max-w-2xl mx-auto">
            Explore ancient codes, learn cryptographic techniques, and test your
            skills.
          </p>
        </header>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <CipherSelector
              selectedCipherType={selectedCipherType}
              onSelect={handleCipherSelect}
            />

            <main className="flex-1 min-w-0">
              {!selectedCipherInfo ? (
                <Card className="shadow-xl bg-white animate-fade-in">
                  <CardContent className="p-10 text-center">
                    <Info size={48} className="mx-auto text-blue-500 mb-4" />
                    <p className="text-xl font-semibold text-slate-700">
                      Welcome, Cryptographer!
                    </p>
                    <p className="text-slate-500 mt-2">
                      Select a cipher from the list on the left to learn its
                      secrets, see it in action, and practice your skills.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-xl bg-white animate-fade-in">
                  <CardHeader className="border-b border-slate-200 p-6">
                    <div className="flex items-center">
                      <span className="mr-3 p-2 bg-blue-100 rounded-full">
                        {React.cloneElement(cipherIcons[selectedCipherType!], {
                          className: `text-blue-600`,
                          size: 24,
                        })}
                      </span>
                      <CardTitle className="text-2xl lg:text-3xl font-bold text-blue-700 font-serif">
                        {selectedCipherInfo.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm text-slate-600 mt-2 ml-12">
                      {selectedCipherInfo.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {selectedDetailedData?.history && (
                      <section>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2 flex items-center font-serif">
                          <History size={18} className="mr-2 text-amber-600" /> A
                          Glimpse into the Past
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/60 p-4 rounded-md border border-amber-200">
                          {selectedDetailedData.history}
                        </p>
                      </section>
                    )}

                    {selectedCipherType !== 'riddle' && (
                      <section>
                        <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center font-serif">
                          <Wand2 size={18} className="mr-2 text-blue-600" />{' '}
                          Cipher Workbench
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-1">
                            <Label htmlFor="inputText">Your Text:</Label>
                            <Textarea
                              id="inputText"
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              placeholder="Enter text to transform..."
                              className="w-full min-h-[100px] shadow-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="outputText">
                              Transformed Text:
                            </Label>
                            <Textarea
                              id="outputText"
                              value={outputText}
                              readOnly
                              placeholder="Result will appear here..."
                              className="w-full min-h-[100px] bg-slate-50 shadow-sm"
                            />
                          </div>
                        </div>

                        {['caesar', 'substitution', 'transposition'].includes(
                          selectedCipherType!
                        ) && (
                          <div className="mb-4 space-y-1">
                            <Label htmlFor="keyOrConfigInput">
                              {selectedCipherType === 'caesar'
                                ? 'Shift Amount (1-25):'
                                : selectedCipherType === 'substitution'
                                ? 'Substitution Key (26 unique letters):'
                                : selectedCipherType === 'transposition'
                                ? 'Number of Columns (2-10):'
                                : 'Key/Config:'}
                            </Label>
                            <Input
                              id="keyOrConfigInput"
                              type={
                                selectedCipherType === 'caesar' ||
                                selectedCipherType === 'transposition'
                                  ? 'number'
                                  : 'text'
                              }
                              value={
                                selectedCipherType === 'caesar'
                                  ? String(keyOrConfig.shift || '')
                                  : selectedCipherType === 'transposition'
                                  ? String(keyOrConfig.key || '')
                                  : String(keyOrConfig.key || '')
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                setKeyOrConfig((prev) => {
                                  const newConfig = { ...prev };
                                  if (selectedCipherType === 'caesar') {
                                    newConfig.shift =
                                      value === ''
                                        ? undefined
                                        : parseInt(value, 10);
                                  } else if (
                                    selectedCipherType === 'transposition'
                                  ) {
                                    newConfig.key =
                                      value === ''
                                        ? undefined
                                        : parseInt(value, 10);
                                  } else if (
                                    selectedCipherType === 'substitution'
                                  ) {
                                    newConfig.key = value
                                      .toUpperCase()
                                      .replace(/[^A-Z]/g, '');
                                  }
                                  return newConfig;
                                });
                              }}
                              placeholder={
                                selectedCipherType === 'substitution'
                                  ? 'QWERTY...'
                                  : selectedCipherType === 'caesar'
                                  ? 'e.g., 3'
                                  : 'e.g., 5'
                              }
                              className="mt-1 w-full md:w-2/3 shadow-sm font-mono tracking-wider"
                              min={
                                selectedCipherType === 'caesar'
                                  ? 1
                                  : selectedCipherType === 'transposition'
                                  ? 2
                                  : undefined
                              }
                              max={
                                selectedCipherType === 'caesar'
                                  ? 25
                                  : selectedCipherType === 'transposition'
                                  ? 10
                                  : undefined
                              }
                              maxLength={
                                selectedCipherType === 'substitution'
                                  ? 26
                                  : undefined
                              }
                            />
                          </div>
                        )}

                        <div className="flex space-x-3 pt-2">
                          <Button
                            variant="primary"
                            onClick={() =>
                              handleEncryptionDecryption('encrypt')
                            }
                            icon={<LockKeyhole size={16} />}
                            size="md"
                          >
                            Encrypt
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() =>
                              handleEncryptionDecryption('decrypt')
                            }
                            icon={<KeyRound size={16} />}
                            size="md"
                          >
                            Decrypt
                          </Button>
                        </div>
                      </section>
                    )}

                    {selectedDetailedData?.example && (
                      <section className="pt-4">
                        <h3 className="text-md font-semibold text-slate-700 mb-2 flex items-center font-serif">
                          <HelpCircle
                            size={16}
                            className="mr-2 text-slate-500"
                          />{' '}
                          Example
                        </h3>
                        <div className="text-xs text-slate-600 bg-slate-100 p-3 rounded-md space-y-1 border border-slate-200">
                          <p>
                            <strong>Original:</strong>{' '}
                            <code className="font-mono bg-white px-1.5 py-0.5 rounded text-blue-700">
                              {selectedDetailedData.example.original}
                            </code>
                          </p>
                          {selectedDetailedData.example.key !== undefined && (
                            <p>
                              <strong>Key/Shift:</strong>{' '}
                              <code className="font-mono bg-white px-1.5 py-0.5 rounded text-blue-700">
                                {String(selectedDetailedData.example.key)}
                              </code>
                            </p>
                          )}
                          <p>
                            <strong>
                              {selectedCipherType === 'riddle'
                                ? 'Solution'
                                : 'Encrypted'}
                              :
                            </strong>{' '}
                            <code className="font-mono bg-white px-1.5 py-0.5 rounded text-blue-700">
                              {selectedDetailedData.example.encrypted}
                            </code>
                          </p>
                        </div>
                      </section>
                    )}

                    {selectedDetailedData?.tips && (
                      <section className="pt-4">
                        <h3 className="text-lg font-semibold text-slate-700 mb-2 flex items-center font-serif">
                          <Lightbulb
                            size={18}
                            className="mr-2 text-amber-600"
                          />{' '}
                          {selectedCipherType === 'riddle'
                            ? "Solver's Tips"
                            : "Decoder's Tips"}
                        </h3>
                        <div className="text-sm text-slate-600 leading-relaxed bg-amber-50/60 p-4 rounded-md border border-amber-200">
                          {selectedDetailedData.tips.split('\n').map(
                            (paragraph, index) => (
                              <p
                                key={index}
                                className={index > 0 ? 'mt-2' : ''}
                              >
                                {paragraph}
                              </p>
                            )
                          )}
                        </div>
                      </section>
                    )}
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;