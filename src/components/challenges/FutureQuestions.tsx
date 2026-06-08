import { useState } from "react";
import { AnswerOption } from "@/components/challenges/QuestionChallenge";

interface FutureQuestionsProps {
  questions: { question: string; answers: string[]; correctAnswer: number }[];
  onComplete: () => void;
  onCorrect: () => void;
  onWrong: () => void;
}

export function FutureQuestions({
  questions,
  onComplete,
  onCorrect,
  onWrong,
}: FutureQuestionsProps) {
  const [index, setIndex] = useState(0);

  const handleSelect = (answerIndex: number) => {
    const q = questions[index];
    if (answerIndex === q.correctAnswer) {
      onCorrect();
      if (index + 1 >= questions.length) {
        onComplete();
      } else {
        setIndex((i) => i + 1);
      }
    } else {
      onWrong();
    }
  };

  const q = questions[index];

  return (
    <div className="space-y-4">
      <p className="text-xs text-lavender font-medium">
        Pitanje {index + 1} od {questions.length}
      </p>
      <p className="font-display font-semibold">{q.question}</p>
      <div className="space-y-2">
        {q.answers.map((a, i) => (
          <AnswerOption key={i} text={a} index={i} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
