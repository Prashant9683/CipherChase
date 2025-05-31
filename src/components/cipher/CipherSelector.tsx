import React from 'react';
import { CipherType, cipherInfo } from '../../types';
import { LockKeyhole, CheckCircle, ScrollText, Brain } from 'lucide-react';

interface CipherSelectorProps {
    selectedCipherType: CipherType | null;
    onSelect: (cipherType: CipherType) => void;
}

const cipherIcons: Record<CipherType, React.ReactElement> = {
    caesar: <LockKeyhole size={20} className="text-blue-500" />,
    atbash: <LockKeyhole size={20} className="text-blue-500" />,
    substitution: <LockKeyhole size={20} className="text-blue-500" />,
    transposition: <LockKeyhole size={20} className="text-blue-500" />,
    anagram: <Brain size={20} className="text-amber-500" />,
    mirror: <LockKeyhole size={20} className="text-blue-500" />,
    riddle: <Brain size={20} className="text-amber-500" />,
    binary: <ScrollText size={20} className="text-gray-500" />,
    morse: <ScrollText size={20} className="text-gray-500" />,
};

const CipherSelector: React.FC<CipherSelectorProps> = ({
                                                           selectedCipherType,
                                                           onSelect,
                                                       }) => {
    const cipherTypes = Object.keys(cipherInfo) as CipherType[];

    return (
        <aside className="w-full md:w-72 space-y-2 md:pr-6 md:border-r border-slate-200">
            <h2 className="text-lg font-semibold text-slate-700 font-serif mb-4 px-1">
                Select a Cipher
            </h2>
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0">
                {cipherTypes.map((cipherType) => {
                    const info = cipherInfo[cipherType];
                    const isSelected = selectedCipherType === cipherType;
                    return (
                        <button
                            key={cipherType}
                            onClick={() => onSelect(cipherType)}
                            className={`flex-shrink-0 md:flex-shrink transition-all duration-200 ease-in-out rounded-lg p-3 md:p-4 
                ${
                                isSelected
                                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                                    : 'bg-white hover:bg-slate-50 border-transparent'
                            } border cursor-pointer group min-w-[200px] md:min-w-0 w-full`}
                        >
                            <div className="flex items-center gap-3">
                <span
                    className={`p-2 rounded-full ${
                        isSelected ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                >
                  {React.cloneElement(cipherIcons[cipherType], {
                      size: 16,
                      className: isSelected ? 'text-blue-600' : 'text-slate-600',
                  })}
                </span>
                                <div className="flex-1 text-left">
                                    <h3
                                        className={`text-sm font-medium ${
                                            isSelected ? 'text-blue-700' : 'text-slate-700'
                                        }`}
                                    >
                                        {info.name}
                                    </h3>
                                    <p
                                        className={`text-xs mt-0.5 line-clamp-2 ${
                                            isSelected ? 'text-blue-600' : 'text-slate-500'
                                        }`}
                                    >
                                        {info.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
};

export default CipherSelector;