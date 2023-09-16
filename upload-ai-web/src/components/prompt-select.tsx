import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { api } from '@/lib/axios';

interface Prompts {
  id: string;
  title: string;
  template: string;
}

interface PromptsSelect {
  onPromptSelected: (template: string) => void;
}

export const PromptSelect = ({ onPromptSelected }: PromptsSelect) => {
  const [prompts, setPrompts] = useState<null | Array<Prompts>>(null);

  function handlePromptSelected(promptId: string) {
    const selectedPrompt: Prompts | undefined = prompts?.find(
      (prompt) => prompt.id === promptId
    );

    if (!selectedPrompt) {
      return;
    }

    onPromptSelected(selectedPrompt.template);
  }

  useEffect(() => {
    api.get('/prompts').then((response) => {
      setPrompts(response.data);
    });
  }, []);

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder='Selecione um prompt' />
      </SelectTrigger>
      <SelectContent>
        {prompts &&
          prompts.map((prompt) => {
            return (
              <SelectItem key={prompt.id} value={prompt.id}>
                {prompt.title}
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
};
