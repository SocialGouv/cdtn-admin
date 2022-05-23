import withAdminEdit from "../../../src/templates/withAdminEdit";

const componentDidMount = async (api, id) => {
  const agreements = await api.fetchAll("/agreements", { id });
  const allAgreements = await api.fetchAll("/agreements");

  const fields = [
    {
      label: "Nom",
      name: "name",
      type: "input",
    },
    {
      label: "IDCC",
      name: "idcc",
      type: "input",
    },
    {
      label: "Convention parente",
      name: "parent_id",
      options: allAgreements.map(({ id, idcc, name }) => ({
        label: `${idcc} - ${name}`,
        value: id,
      })),
      type: "select",
    },
  ];

  return {
    defaultData: agreements[0],
    fields,
  };
};

const AdminAgreementsEditPage = withAdminEdit(
  {
    apiPath: "/agreements",
    i18nIsFeminine: true,
    i18nSubject: "convention",
    indexPath: "/agreements",
  },
  componentDidMount
);

export default AdminAgreementsEditPage;
