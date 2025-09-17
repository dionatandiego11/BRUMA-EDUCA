import React, { useState, useEffect, useCallback } from 'react';
// import { Link } from 'react-router-dom'; // Removido para evitar erro de contexto do roteador

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

// --- Mock DB Service for demonstration ---
const dbService = {
    addScore: async (data: any) => {
        console.log("Salvando no DB:", data);
        // Simula uma pequena demora da rede
        await new Promise(resolve => setTimeout(resolve, 200));
        return { success: true, data };
    }
};


// --- ESTRUTURA DE DADOS ---
const schoolData = {
    escolas: {
        'E.M. Lucas Marciano Da Silva': {
            series: {
                '8º Ano': {
                    turmas: {
                        'Turma 1': {
                            alunos: ['Aleph Zapata Pereira Alvarenga', 'Beatriz Martins', 'Carlos Eduardo'],
                            professores: { 'Doriedson': 'Matemática', 'Victor': 'Português' },
                        },
                        'Turma 2': {
                            alunos: ['Ana Beatriz Damasceno De Jesus', 'Daniela Faria', 'Eduardo Costa'],
                            professores: { 'Taynara': 'Matemática', 'Victor': 'Português' },
                        },
                    },
                },
                '6º Ano': {
                    turmas: {
                        'Turma 1': {
                            alunos: ['Gabriel Pereira', 'Helena Souza', 'Igor Andrade'],
                            professores: { 'Doriedson': 'Matemática', 'Alessandra': 'Português' },
                        },
                    },
                }
            },
        },
    },
    habilidades: {
        'Matemática': ['EF07MA01A', 'EF07MA03', 'EF07MA40MG', 'EF05MA14', 'EF05MA15'],
        'Português': ['EF69LP42', 'EF05LP07', 'EF35LP26', 'EF69LP54', 'EF08LP13'],
    },
};

type RespostaAlternativa = 'A' | 'B' | 'C' | 'D';
const alternativas: RespostaAlternativa[] = ['A', 'B', 'C', 'D'];

// --- COMPONENTES REUTILIZÁVEIS ---
interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
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
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

// --- PÁGINA PRINCIPAL ---
const InsertDataPage: React.FC = () => {
    // Estados para os seletores do formulário
    const [escola, setEscola] = useState('');
    const [serie, setSerie] = useState('');
    const [turma, setTurma] = useState('');
    const [aluno, setAluno] = useState('');
    const [professor, setProfessor] = useState('');
    const [disciplina, setDisciplina] = useState('');

    // Estado para as respostas das questões
    const [respostas, setRespostas] = useState<{ [key: string]: RespostaAlternativa | null }>({});

    // Estados para feedback ao usuário
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    // --- LÓGICA PARA POPULAR OS SELECTS DINAMICAMENTE ---
    const escolas = Object.keys(schoolData.escolas);
    const series = escola ? Object.keys(schoolData.escolas[escola]?.series || {}) : [];
    const turmas = serie ? Object.keys(schoolData.escolas[escola]?.series[serie]?.turmas || {}) : [];
    const alunos = turma ? schoolData.escolas[escola]?.series[serie]?.turmas[turma]?.alunos || [] : [];
    const professores = turma ? Object.keys(schoolData.escolas[escola]?.series[serie]?.turmas[turma]?.professores || {}) : [];
    const questoes = disciplina ? schoolData.habilidades[disciplina] || [] : [];

    // --- FUNÇÕES DE CALLBACK OTIMIZADAS ---
    const resetFields = useCallback((level: 'escola' | 'serie' | 'turma') => {
        if (level === 'escola') setSerie('');
        if (level === 'escola' || level === 'serie') setTurma('');
        if (level === 'escola' || level === 'serie' || level === 'turma') {
            setAluno('');
            setProfessor('');
            setDisciplina('');
            setRespostas({});
        }
    }, []);

    const handleProfessorChange = (prof: string) => {
        setProfessor(prof);
        if (prof && turma && serie && escola) {
            const disc = schoolData.escolas[escola].series[serie].turmas[turma].professores[prof];
            setDisciplina(disc);
        } else {
            setDisciplina('');
        }
        setRespostas({});
    };

    const handleRespostaChange = useCallback((questao: string, valor: RespostaAlternativa) => {
        setRespostas((prev) => ({ ...prev, [questao]: valor }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!escola || !serie || !turma || !aluno || !professor || !disciplina) {
            setError('Todos os campos de identificação devem ser preenchidos.');
            return;
        }

        const respostasMarcadas = Object.values(respostas).filter(r => r !== null);
        if (questoes.length > 0 && respostasMarcadas.length !== questoes.length) {
            setError('Todas as questões devem ter uma alternativa selecionada.');
            return;
        }

        setIsLoading(true);
        try {
            const dadosParaSalvar = questoes.map((questao) => ({
                escola,
                serie,
                turma,
                aluno,
                professor,
                disciplina,
                habilidade: questao,
                resposta: respostas[questao], // Salva a alternativa 'A', 'B', 'C' ou 'D'
            }));

            await Promise.all(dadosParaSalvar.map(dado => dbService.addScore(dado)));

            setSuccess('Dados inseridos com sucesso!');

            // Resetar o formulário
            setAluno('');
            setRespostas({});

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
                            <SelectField label="Escola" value={escola} onChange={(v) => { setEscola(v); resetFields('escola'); }} options={escolas} placeholder="Selecione a Escola" />
                            <SelectField label="Série/Ano" value={serie} onChange={(v) => { setSerie(v); resetFields('serie'); }} options={series} placeholder="Selecione a Série" disabled={!escola} />
                            <SelectField label="Turma" value={turma} onChange={(v) => { setTurma(v); resetFields('turma'); }} options={turmas} placeholder="Selecione a Turma" disabled={!serie} />
                            <SelectField label="Professor(a)" value={professor} onChange={handleProfessorChange} options={professores} placeholder="Selecione o Professor" disabled={!turma} />
                            <SelectField label="Aluno(a)" value={aluno} onChange={setAluno} options={alunos} placeholder="Selecione o Aluno" disabled={!turma} />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                                <input type="text" value={disciplina} readOnly disabled className="w-full border rounded p-2 bg-gray-100" />
                            </div>
                        </div>

                        {disciplina && (
                            <div className="border-t pt-4 mt-4">
                                <label className="block text-base font-semibold text-gray-800 mb-3">Habilidades (Questões)</label>
                                {questoes.length === 0 ? (
                                    <p className="text-sm text-gray-500">Nenhuma habilidade encontrada para esta disciplina.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {questoes.map((q) => (
                                            <div key={q} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md bg-gray-50 border">
                                                <span className="font-mono text-sm font-medium text-gray-900 mb-2 sm:mb-0">{q}</span>
                                                <div className="flex items-center space-x-2">
                                                    {alternativas.map(alt => (
                                                        <button
                                                            key={alt}
                                                            type="button"
                                                            onClick={() => handleRespostaChange(q, alt)}
                                                            className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${respostas[q] === alt ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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