// src/pages/HowToCAD.jsx
import React, { useState } from "react";

const sections = [
  {
    id: "overview",
    title: "1. What this procedure is for (Overview & Objectives)",
    body: (
      <>
        <p>
          This guide explains how we organise AutoCAD files for a show so
          everyone drafts in a consistent way and can safely XREF each other's
          drawings.
        </p>
        <ul>
          <li>
            All productions use the same folder and file naming structure.
          </li>
          <li>
            There is one main <strong>Production drawing</strong> in{" "}
            <code>RT_BaseFile</code> that shows the whole show.
          </li>
          <li>
            Audio, Lighting, Stage, and Video each have their own drawings which
            are XREFed into that Production drawing.
          </li>
          <li>
            Using XREFs avoids bloated DWGs and reduces mistakes when multiple
            people work on the same show.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "folder-structure",
    title: "2. Folder structure – where everything lives",
    body: (
      <>
        <p>
          Every show has a <strong>Plans</strong> folder inside its Technical
          folder. This is the root folder for all DWG files.
        </p>
        <ul>
          <li>
            Example path:
            <br />
            <code>ShowName_2025/Technical/Plans</code>
          </li>
        </ul>
        <p>Inside the Plans folder, create these subfolders:</p>
        <ul>
          <li>
            <code>Audio/</code>
          </li>
          <li>
            <code>Lighting/</code>
          </li>
          <li>
            <code>Stage/</code>
          </li>
          <li>
            <code>Video/</code>
          </li>
          <li>
            <code>RT_BaseFile/</code>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "templates-naming",
    title: "3. Templates & file naming rules",
    body: (
      <>
        <p>
          We always start from venue templates and then rename them for each
          production.
        </p>
        <p>Template examples:</p>
        <ul>
          <li>
            <code>Audio/Audio_Template_Red_Theatre_2025-26.dwg</code>
          </li>
          <li>
            <code>Lighting/Lighting_Template_Red_Theatre_2025-26.dwg</code>
          </li>
          <li>
            <code>Stage/Stage_Template_Red_Theatre_2025-26.dwg</code>
          </li>
          <li>
            <code>Video/Video_Template_Red_Theatre_2025-26.dwg</code>
          </li>
          <li>
            <code>RT_BaseFile/GroundPlan_Red_Theatre_2025-26.dwg</code>
          </li>
        </ul>

        <p>For a specific show, rename them like:</p>
        <ul>
          <li>
            <code>Audio/Audio_ShowName_Red_Theatre_YYYY.dwg</code>
          </li>
          <li>
            <code>Lighting/Lighting_ShowName_Red_Theatre_YYYY.dwg</code>
          </li>
          <li>
            <code>Stage/Stage_ShowName_Red_Theatre_YYYY.dwg</code>
          </li>
          <li>
            <code>Video/Video_ShowName_Red_Theatre_YYYY.dwg</code>
          </li>
          <li>
            <code>RT_BaseFile/Production_ShowName_Red_Theatre_YYYY.dwg</code>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "xref-structure",
    title: "4. How XREFs work in this setup",
    body: (
      <>
        <h4>The Production drawing</h4>
        <ul>
          <li>XREF each department DWG.</li>
          <li>
            Use <strong>relative paths</strong> (e.g.{" "}
            <code>../Audio/Audio_ShowName_Red_Theatre_YYYY.dwg</code>).
          </li>
          <li>
            Use <strong>Overlay</strong> mode.
          </li>
        </ul>

        <h4>Department drawings</h4>
        <ul>
          <li>You may XREF other departments if helpful.</li>
          <li>Never edit inside an XREF — open the source DWG instead.</li>
        </ul>
      </>
    ),
  },
  {
    id: "workflow",
    title: "5. Step-by-step: how to set up a new show",
    body: (
      <>
        <ol>
          <li>Create the Plans folder + subfolders.</li>
          <li>Copy the DWG templates into each folder.</li>
          <li>Rename each template according to the show.</li>
          <li>Set up XREFs in the Production drawing.</li>
          <li>Track changes via the title block.</li>
          <li>Plot from the Production DWG.</li>
        </ol>
      </>
    ),
  },
  {
    id: "gdrive",
    title: "6. Working from Google Drive (IMPORTANT)",
    body: (
      <>
        <p>
          Always use the <strong>Google Drive Desktop App</strong> and work from
          the synced folder.
        </p>
        <ul>
          <li>Mark the Plans folder “Available offline”.</li>
          <li>
            Never download a DWG from the browser, edit it, and upload it again.
          </li>
          <li>This breaks XREFs for everyone else.</li>
        </ul>
      </>
    ),
  },
  {
    id: "layers",
    title: "7. Layers & layer filters",
    body: (
      <>
        <h4>Layer discipline</h4>
        <ul>
          <li>Avoid drawing on Layer 0.</li>
          <li>Use clear layer names (as in the templates).</li>
          <li>Use layer filters to quickly switch views.</li>
        </ul>
        <h4>Freeze vs Off</h4>
        <ul>
          <li>
            <strong>Freeze</strong> = hides + frees memory (better for
            performance).
          </li>
          <li>
            <strong>Off</strong> = hides but still loads the layer.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "xref-visibility",
    title: "8. XREF visibility & draw order",
    body: (
      <>
        <ul>
          <li>Use layer filters to hide/show whole referenced drawings.</li>
          <li>
            If the XREF hides your geometry, use <code>DRAWORDER</code> → Send
            to Back.
          </li>
          <li>
            To attach an XREF:{" "}
            <code>XREF → Attach DWG → Overlay → Relative path</code>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "fixing",
    title: "9. Fixing missing XREFs & editing linked drawings",
    body: (
      <>
        <h4>Missing XREFs</h4>
        <ul>
          <li>Open XREF Manager.</li>
          <li>Right-click → “Select new path”.</li>
          <li>Point it to the correct Plans folder.</li>
        </ul>

        <h4>Editing an XREF</h4>
        <ul>
          <li>Click the XREF → Right-click → “Open Xref”.</li>
          <li>Edit, save, return to main DWG.</li>
          <li>Reload if AutoCAD prompts.</li>
        </ul>
      </>
    ),
  },
  {
    id: "summary",
    title: "10. Summary — How to CAD correctly here",
    body: (
      <>
        <ul>
          <li>Use templates.</li>
          <li>Name files consistently.</li>
          <li>Never copy–paste drawings — always XREF.</li>
          <li>Work from the Drive desktop folder.</li>
          <li>Use layers, filters, and draw order to stay organised.</li>
        </ul>
      </>
    ),
  },
];

function SectionCard({ section }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`cad-section ${open ? "cad-section-open" : ""}`}>
      <button
        className="btn cad-toggle"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="cad-toggle-title">{section.title}</span>
        <span className="cad-toggle-icon">{open ? "▲" : "▼"}</span>
      </button>

      {open && <div className="cad-body">{section.body}</div>}
    </div>
  );
}

export default function HowToCAD() {
  return (
    <div className="page-inner cad-page">
      <h1 className="cad-heading">How to CAD</h1>
      <p className="cad-subtitle">
        A practical breakdown of the “Working Procedure for Production File
        Structure” — click a section to expand.
      </p>

      <div className="cad-sections">
        {sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
