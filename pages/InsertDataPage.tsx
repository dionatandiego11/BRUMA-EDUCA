import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService';
import { Escola, Serie, Turma, Professor, Aluno, Provao, Questao, Alternativa, Disciplina } from '../types';


// --- Mock Components for demonstration ---
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg shadow-md border p-6 ${className}`}>
        {children}
    </div>
);

const Button = ({ children, onClick, type = 'button', disabled = false }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);

const alternativas: Alternativa[] = ['A', 'B', 'C', 'D'];

// --- COMPONENTES REUTILIZÁVEIS ---
interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options, placeholder, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full border rounded p-2 bg-white disabled:bg-gray-100 transition-colors"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

// --- PÁGINA PRINCIPAL ---
const InsertDataPage: React.FC = () => {
    // Estados para os dados do BD
    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [series, setSeries] = useState<Serie[]>([]);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [professores, setProfessores] = useState<Professor[]>([]);
    const [provoes, setProvoes] = useState<Provao[]>([]);
    const [questoes, setQuestoes] = useState<Questao[]>([]);

    // Estados para os seletores do formulário
    const [selectedEscola, setSelectedEscola] = useState('');
    const [selectedSerie, setSelectedSerie] = useState('');
    const [selectedTurma, setSelectedTurma] = useState('');
    const [selectedProvao, setSelectedProvao] = useState('');
    const [selectedAluno, setSelectedAluno] = useState('');

    // Estado para as respostas das questões
    const [respostas, setRespostas] = useState<Map<string, Alternativa>>(new Map());

    // Estados para feedback ao usuário
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Carregar dados iniciais
    useEffect(() => {
        setEscolas(dbService.getEscolas());
    }, []);

    // Efeitos em cascata para carregar os dados
    useEffect(() => {
        if (selectedEscola) setSeries(dbService.getSeriesByEscola(selectedEscola));
        else setSeries([]);
        setSelectedSerie('');
    }, [selectedEscola]);

    useEffect(() => {
        if (selectedSerie) setTurmas(dbService.getTurmasBySerie(selectedSerie));
        else setTurmas([]);
        setSelectedTurma('');
    }, [selectedSerie]);

    useEffect(() => {
        if (selectedTurma) {
            setAlunos(dbService.getAlunosByTurma(selectedTurma));
            setProfessores(dbService.getProfessoresByTurma(selectedTurma));
            setProvoes(dbService.getProvoesByTurma(selectedTurma));
        } else {
            setAlunos([]);
            setProfessores([]);
            setProvoes([]);
        }
        setSelectedProvao('');
        setSelectedAluno('');
    }, [selectedTurma]);

    useEffect(() => {
        if (selectedProvao) {
            setQuestoes(dbService.getQuestoesByProvao(selectedProvao));
        } else {
            setQuestoes([]);
        }
        setRespostas(new Map());
    }, [selectedProvao]);


    // Limpa as mensagens de feedback após 3 segundos
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const handleRespostaChange = useCallback((questaoId: string, valor: Alternativa) => {
        setRespostas(prev => new Map(prev).set(questaoId, valor));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedEscola || !selectedSerie || !selectedTurma || !selectedAluno || !selectedProvao) {
            setError('Todos os campos de identificação devem ser preenchidos.');
            return;
        }

        if (questoes.length > 0 && respostas.size !== questoes.length) {
            setError('Todas as questões devem ter uma alternativa selecionada.');
            return;
        }

        setIsLoading(true);
        try {
            const escola = escolas.find(e => e.id === selectedEscola);
            const serie = series.find(s => s.id === selectedSerie);
            const aluno = alunos.find(a => a.id === selectedAluno);

            if (!escola || !serie || !aluno) {
                throw new Error("Dados de escola, série ou aluno não encontrados");
            }

            for (const questao of questoes) {
                const resposta = respostas.get(questao.id);
                const gabarito = dbService.getGabaritoByQuestao(questao.id);

                if (resposta && gabarito) {
                    const scoreValue = resposta === gabarito.respostaCorreta ? 1 : 0;

                    // NOTE: The current database schema does not associate a professor with a specific subject in a class.
                    // As a result, we are assigning the first professor found for the class to the score.
                    // This is a known limitation.
                    const professor = professores.length > 0 ? professores[0] : undefined;

                    await dbService.addScore({
                        school: escola.nome,
                        grade: serie.nome,
                        student: aluno.nome,
                        teacher: professor ? professor.nome : 'N/A',
                        subject: questao.disciplina,
                        questionCode: questao.habilidade_codigo,
                        score: scoreValue,
                    });
                }
            }

            setSuccess('Dados inseridos com sucesso!');
            setSelectedAluno('');
            setRespostas(new Map());

        } catch (err) {
            setError('Ocorreu um erro ao salvar os dados.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-left mb-8">
                    <a href="/" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">&larr; Voltar para a Home</a>
                </div>
                <Card>
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
                        Inserir Resultado das Questões
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField label="Escola" value={selectedEscola} onChange={setSelectedEscola} options={escolas.map(e => ({ value: e.id, label: e.nome }))} placeholder="Selecione a Escola" />
                            <SelectField label="Série/Ano" value={selectedSerie} onChange={setSelectedSerie} options={series.map(s => ({ value: s.id, label: s.nome }))} placeholder="Selecione a Série" disabled={!selectedEscola} />
                            <SelectField label="Turma" value={selectedTurma} onChange={setSelectedTurma} options={turmas.map(t => ({ value: t.id, label: t.nome }))} placeholder="Selecione a Turma" disabled={!selectedSerie} />
                            <SelectField label="Provão" value={selectedProvao} onChange={setSelectedProvao} options={provoes.map(p => ({ value: p.id, label: p.nome }))} placeholder="Selecione o Provão" disabled={!selectedTurma} />
                            <SelectField label="Aluno(a)" value={selectedAluno} onChange={setSelectedAluno} options={alunos.map(a => ({ value: a.id, label: a.nome }))} placeholder="Selecione o Aluno" disabled={!selectedTurma} />
                        </div>

                        {selectedProvao && (
                            <div className="border-t pt-4 mt-4">
                                <label className="block text-base font-semibold text-gray-800 mb-3">Habilidades (Questões)</label>
                                {questoes.length === 0 ? (
                                    <p className="text-sm text-gray-500">Nenhuma questão encontrada para este provão.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {questoes.map((q) => (
                                            <div key={q.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md bg-gray-50 border">
                                                <div className="flex-1">
                                                    <p className="font-mono text-sm font-medium text-gray-900 mb-1">{q.habilidade_codigo}</p>
                                                    <p className="text-xs text-gray-600">{q.descricao}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                                    {alternativas.map(alt => (
                                                        <button
                                                            key={alt}
                                                            type="button"
                                                            onClick={() => handleRespostaChange(q.id, alt)}
                                                            className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${respostas.get(q.id) === alt ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                                        >
                                                            {alt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="text-center pt-4">
                            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                            {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : 'Salvar Dados'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default InsertDataPage;