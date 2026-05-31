import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Container, Group, Text } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconLock, IconRotateClockwise2, IconX } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router';
import {
  fetchProgress,
  isMoleculeMastered,
  type ProgressStore,
} from '../features/chem-assembler/api/progress';
import { lessonGroupData } from '../features/chem-assembler/data/lessonLibrary';
import { getRevisionQuiz } from '../features/chem-assembler/data/revisionQuizzes';

const buttonBase: CSSProperties = {
  borderRadius: 8,
  fontFamily: '"DM Sans", system-ui, sans-serif',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

export function RevisionQuiz() {
  const [searchParams] = useSearchParams();
  const groupId = Number(searchParams.get('group') ?? 1);
  const group = lessonGroupData.find(candidate => candidate.groupId === groupId);
  const quiz = getRevisionQuiz(groupId);
  const [progress, setProgress] = useState<ProgressStore | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchProgress()
      .then((store) => {
        setProgress(store);
        setLoadError(null);
      })
      .catch(() => setLoadError('Progress is unavailable right now.'));
  }, []);

  const masteredCount = useMemo(() => {
    if (!group) return 0;
    return group.molecules.filter(molecule => isMoleculeMastered(progress, molecule)).length;
  }, [group, progress]);

  if (!group || !quiz) {
    return (
      <Container size="md">
        <Text style={{ color: '#B34A33', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          Revision quiz not found.
        </Text>
        <Link to="/lessons" style={{ color: '#1A2E3B', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          Back to lessons
        </Link>
      </Container>
    );
  }

  const unlocked = masteredCount === group.molecules.length;
  const score = quiz.questions.filter((question, index) => answers[index] === question.answer).length;
  const allAnswered = quiz.questions.every((_, index) => answers[index]);

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      <Container size="md">
        <Link
          to="/lessons"
          style={{
            ...buttonBase,
            color: '#4A6275',
            textDecoration: 'none',
            marginBottom: 22,
            fontSize: '0.84rem',
          }}
        >
          <IconArrowLeft size={17} stroke={2.2} />
          Back to lessons
        </Link>

        <Text style={{
          color: '#E2603F',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          marginBottom: 8,
        }}>
          Revision quiz
        </Text>
        <h1 style={{ margin: '0 0 8px' }}>{quiz.title}</h1>
        <Text style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontStyle: 'italic',
          color: '#4A6275',
          fontSize: '1rem',
          marginBottom: 28,
        }}>
          Unlocks after all {group.molecules.length} molecules in {group.title} are mastered.
        </Text>

        {loadError && (
          <Text style={{ color: '#B34A33', marginBottom: 18, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
            {loadError}
          </Text>
        )}

        {!unlocked ? (
          <section style={{
            background: '#FFFFFF',
            border: '1.5px solid #D3D1CB',
            borderRadius: 8,
            padding: 22,
          }}>
            <Group gap={12} align="center" mb={12}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: '#F0EEE9',
                color: '#777C78',
              }}>
                <IconLock size={22} stroke={2.2} />
              </div>
              <div>
                <Text style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: '1.25rem',
                  fontWeight: 650,
                  color: '#1A2E3B',
                }}>
                  Quiz locked
                </Text>
                <Text style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: '#4A6275' }}>
                  {masteredCount}/{group.molecules.length} molecules mastered in this group.
                </Text>
              </div>
            </Group>
            <Text style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: '#4A6275', lineHeight: 1.5 }}>
              Finish mastering the remaining molecules, then come back for the revision check.
            </Text>
          </section>
        ) : (
          <>
            <section style={{
              background: '#FFFFFF',
              border: '1px solid #E5E1D8',
              borderRadius: 8,
              padding: 18,
              marginBottom: 22,
            }}>
              <Group justify="space-between" align="center" gap={16}>
                <Text style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontWeight: 700,
                  color: '#1A2E3B',
                }}>
                  {submitted ? `Score: ${score}/${quiz.questions.length}` : `${quiz.questions.length} questions`}
                </Text>
                <button
                  type="button"
                  onClick={resetQuiz}
                  style={{
                    ...buttonBase,
                    border: '1.5px solid #C9C5BB',
                    background: '#FFFFFF',
                    color: '#1A2E3B',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                  }}
                >
                  <IconRotateClockwise2 size={16} stroke={2.2} />
                  Reset
                </button>
              </Group>
            </section>

            {quiz.questions.map((question, questionIndex) => {
              const selected = answers[questionIndex];
              const isCorrect = selected === question.answer;

              return (
                <section
                  key={question.prompt}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E1D8',
                    borderRadius: 8,
                    padding: 18,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{
                    color: '#4A6275',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    marginBottom: 8,
                  }}>
                    Question {questionIndex + 1}
                  </Text>
                  <Text style={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontWeight: 650,
                    fontSize: '1.13rem',
                    color: '#1A2E3B',
                    lineHeight: 1.35,
                    marginBottom: 14,
                  }}>
                    {question.prompt}
                  </Text>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {question.choices.map((choice) => {
                      const choiceIsSelected = selected === choice;
                      const revealCorrect = submitted && choice === question.answer;
                      const revealWrong = submitted && choiceIsSelected && choice !== question.answer;

                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => {
                            if (!submitted) setAnswers(previous => ({ ...previous, [questionIndex]: choice }));
                          }}
                          disabled={submitted}
                          style={{
                            border: `1.5px solid ${revealCorrect ? '#3C8D6A' : revealWrong ? '#B34A33' : choiceIsSelected ? '#1A2E3B' : '#D3D1CB'}`,
                            background: revealCorrect ? '#E1F1E9' : revealWrong ? '#F7DED8' : choiceIsSelected ? '#F0EEE9' : '#FFFFFF',
                            color: '#1A2E3B',
                            borderRadius: 8,
                            padding: '12px 14px',
                            textAlign: 'left',
                            cursor: submitted ? 'default' : 'pointer',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            fontWeight: 650,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          <span>{choice}</span>
                          {revealCorrect && <IconCheck size={18} stroke={2.4} />}
                          {revealWrong && <IconX size={18} stroke={2.4} />}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <Text style={{
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      color: isCorrect ? '#2F7558' : '#B34A33',
                      lineHeight: 1.45,
                      marginTop: 12,
                    }}>
                      {question.explanation}
                    </Text>
                  )}
                </section>
              );
            })}

            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered || submitted}
              style={{
                ...buttonBase,
                border: '1.5px solid #1A2E3B',
                background: '#1A2E3B',
                color: '#FFFFFF',
                padding: '12px 18px',
                fontSize: '0.9rem',
                opacity: !allAnswered || submitted ? 0.55 : 1,
                cursor: !allAnswered || submitted ? 'not-allowed' : 'pointer',
              }}
            >
              <IconCheck size={17} stroke={2.2} />
              Check answers
            </button>
          </>
        )}
      </Container>
    </div>
  );
}
