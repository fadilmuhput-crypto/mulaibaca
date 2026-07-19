"use client";

import { useState } from "react";
import GoalModal from "./GoalModal";

export default function GoalTrigger({
  currentGoal,
  children,
  className,
}: {
  currentGoal: number;
  children: React.ReactNode;
  className?: string;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setShowModal(true)} className={className}>
        {children}
      </button>
      {showModal && (
        <GoalModal
          currentGoal={currentGoal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
