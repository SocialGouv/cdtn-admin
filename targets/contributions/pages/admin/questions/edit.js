import withAdminEdit from "../../../src/templates/withAdminEdit";

const FIELDS = [
  {
    inputType: "number",
    label: "Index",
    name: "index",
    type: "input",
  },
  {
    label: "Intitulé",
    name: "value",
    type: "text",
  },
];

const componentDidMount = async (api, id) => {
  const questions = await api.fetchAll("/questions", { id });

  return {
    defaultData: questions[0],
    fields: FIELDS,
  };
};

const AdminDefinitionsEditPage = withAdminEdit(
  {
    apiPath: "/questions",
    i18nIsFeminine: true,
    i18nSubject: "question",
    indexPath: "/questions",
  },
  componentDidMount,
);

export default AdminDefinitionsEditPage;
