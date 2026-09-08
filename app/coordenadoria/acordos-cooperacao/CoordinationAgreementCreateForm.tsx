"use client";

import { useMemo, useState } from "react";
import { createCoordinationAgreement } from "./actions";
import type {
  CoordinationViableCourseOption,
  CoordinationViableInstitutionOption,
} from "@/lib/queries/coordination-agreements";

type CoordinationAgreementCreateFormProps = {
  viableInstitutions: CoordinationViableInstitutionOption[];
  viableCourses: CoordinationViableCourseOption[];
};

export function CoordinationAgreementCreateForm({
  viableInstitutions,
  viableCourses,
}: CoordinationAgreementCreateFormProps) {
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");

  const filteredCourses = useMemo(
    () =>
      viableCourses.filter(
        (course) => course.institution_id === selectedInstitutionId,
      ),
    [selectedInstitutionId, viableCourses],
  );

  return (
    <form
      action={createCoordinationAgreement}
      className="grid gap-3 px-4 py-4 lg:grid-cols-4"
    >
      <label className="grid gap-1 lg:col-span-4">
        <span className="text-xs font-bold text-slate-600">Instituição</span>
        <select
          name="institution_id"
          required
          value={selectedInstitutionId}
          onChange={(event) => setSelectedInstitutionId(event.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        >
          <option value="">Selecione</option>
          {viableInstitutions.map((institution) => (
            <option key={institution.id} value={institution.id}>
              {institution.name}
            </option>
          ))}
        </select>
      </label>

      {selectedInstitutionId ? (
        <div className="grid gap-1 lg:col-span-4">
          <span className="text-xs font-bold text-slate-600">
            Cursos abrangidos pelo acordo
          </span>

          {filteredCourses.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
              Nenhum curso com sondagem viável encontrado para esta instituição.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => (
                  <label
                    key={`${course.institution_id}-${course.course_id}`}
                    className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                  >
                    <input
                      type="checkbox"
                      name="course_ids"
                      value={course.course_id}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block font-black text-slate-900">
                        {course.course_name}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Curso com sondagem viável
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] font-medium text-slate-500">
            Marque apenas os cursos que deverão constar no acordo desta
            instituição.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500 lg:col-span-4">
          Selecione a instituição para visualizar os cursos disponíveis.
        </div>
      )}

      <label className="grid gap-1">
        <span className="text-xs font-bold text-slate-600">
          Situação inicial
        </span>
        <select
          name="status"
          defaultValue="em_analise"
          required
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        >
          <option value="rascunho">Rascunho</option>
          <option value="em_analise">Em análise</option>
          <option value="minuta_gerada">Minuta gerada</option>
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-xs font-bold text-slate-600">
          Início da vigência
        </span>
        <input
          name="started_at"
          type="date"
          required
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-xs font-bold text-slate-600">
          Fim da vigência
        </span>
        <input
          name="ended_at"
          type="date"
          required
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
      </label>

      <div />

      <label className="grid gap-1 lg:col-span-2">
        <span className="text-xs font-bold text-slate-600">
          Representante legal da instituição
        </span>
        <input
          name="legal_representative_name"
          required
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          placeholder="Nome do representante legal"
        />
      </label>

      <label className="grid gap-1 lg:col-span-2">
        <span className="text-xs font-bold text-slate-600">
          Responsável institucional pelo estágio
        </span>
        <input
          name="institution_responsible_name"
          required
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          placeholder="Nome do responsável pelo acompanhamento"
        />
      </label>

      <label className="grid gap-1 lg:col-span-4">
        <span className="text-xs font-bold text-slate-600">Observações</span>
        <textarea
          name="notes"
          rows={2}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          placeholder="Ex.: acordo iniciado a partir das sondagens aprovadas pela Coordenadoria."
        />
      </label>

      <div className="flex justify-end lg:col-span-4">
        <button
          type="submit"
          disabled={!selectedInstitutionId || filteredCourses.length === 0}
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Registrar acordo
        </button>
      </div>
    </form>
  );
}
