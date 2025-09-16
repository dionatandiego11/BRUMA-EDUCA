import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { dbService } from '../services/dbService';

// --- Simple Item Management (Schools, Teachers, Subjects) ---
const AdminSection: React.FC<{
  title: string;
  itemLabel: string;
  getItems: () => Promise<any[]>;
  addItem: (name: string) => Promise<any>;
}> = ({ title, itemLabel, getItems, addItem }) => {
  const [items, setItems] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items.');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      setError(`${itemLabel} name cannot be empty.`);
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await addItem(newItemName);
      setNewItemName('');
      await fetchItems();
    } catch (err: any) {
      setError(err.message || `Failed to add ${itemLabel}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">{title}</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder={`Novo nome de ${itemLabel.toLowerCase()}`} className="flex-grow" />
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Adicionando...' : `Adicionar ${itemLabel}`}</Button>
      </form>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <ul className="space-y-2">
        {items.map((item) => <li key={item.id} className="bg-slate-100 p-2 rounded-md">{item.name}</li>)}
        {items.length === 0 && <p className="text-slate-500">Nenhum item encontrado.</p>}
      </ul>
    </Card>
  );
};

// --- Hierarchical Item Management (Grades, Classes, Students) ---
const HierarchicalAdminSection: React.FC<{
    title: string;
    itemLabel: string;
    parentLabel: string;
    getParents: () => Promise<any[]>;
    getChildren: (parentId: number) => Promise<any[]>;
    addChild: (name: string, parentId: number) => Promise<any>;
}> = ({ title, itemLabel, parentLabel, getParents, getChildren, addChild }) => {
    const [parents, setParents] = useState<any[]>([]);
    const [selectedParentId, setSelectedParentId] = useState<string>('');
    const [children, setChildren] = useState<any[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getParents().then(setParents).catch(() => setError(`Failed to fetch ${parentLabel}s.`));
    }, []);

    useEffect(() => {
        if (selectedParentId) {
            getChildren(Number(selectedParentId)).then(setChildren).catch(() => setChildren([]));
        } else {
            setChildren([]);
        }
    }, [selectedParentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || !selectedParentId) {
            setError(`${itemLabel} name and a ${parentLabel} selection are required.`);
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await addChild(newItemName, Number(selectedParentId));
            setNewItemName('');
            // Refresh children list
            const updatedChildren = await getChildren(Number(selectedParentId));
            setChildren(updatedChildren);
        } catch (err: any) {
            setError(err.message || `Failed to add ${itemLabel}.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">{title}</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Select label={`Selecione ${parentLabel}`} value={selectedParentId} onChange={e => setSelectedParentId(e.target.value)}>
                    <option value="">{`Selecione um(a) ${parentLabel.toLowerCase()}`}</option>
                    {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                    <Input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder={`Novo nome de ${itemLabel.toLowerCase()}`} className="flex-grow" disabled={!selectedParentId} />
                    <Button type="submit" disabled={isLoading || !selectedParentId}>{isLoading ? '...' : `Adicionar ${itemLabel}`}</Button>
                </form>
            </div>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <ul className="space-y-2">
                {children.map(c => <li key={c.id} className="bg-slate-100 p-2 rounded-md">{c.name}</li>)}
                {selectedParentId && children.length === 0 && <p className="text-slate-500">Nenhum item encontrado para {parentLabel.toLowerCase()} selecionado.</p>}
            </ul>
        </Card>
    );
};


const AdminPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Painel Administrativo</h1>

      <AdminSection title="Gerenciar Escolas" itemLabel="Escola" getItems={dbService.getSchools} addItem={dbService.addSchool} />
      <HierarchicalAdminSection title="Gerenciar Séries" itemLabel="Série" parentLabel="Escola" getParents={dbService.getSchools} getChildren={dbService.getGradesBySchool} addChild={dbService.addGrade} />
      <HierarchicalAdminSection title="Gerenciar Turmas" itemLabel="Turma" parentLabel="Série" getParents={dbService.getAllGrades} getChildren={dbService.getClassesByGrade} addChild={dbService.addClass} />
      <HierarchicalAdminSection title="Gerenciar Alunos" itemLabel="Aluno" parentLabel="Turma" getParents={dbService.getAllClasses} getChildren={dbService.getStudentsByClass} addChild={dbService.addStudent} />
      <AdminSection title="Gerenciar Professores" itemLabel="Professor" getItems={dbService.getTeachers} addItem={dbService.addTeacher} />
      <AdminSection title="Gerenciar Disciplinas" itemLabel="Disciplina" getItems={dbService.getSubjects} addItem={dbService.addSubject} />
    </div>
  );
};

export default AdminPage;
