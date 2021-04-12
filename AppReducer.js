const initialState = {
  network: 'Mainnet',
  address: '',
  publicBoxes: [],
  personalBoxes: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ADDRESS':
      const { address } = action;
      return {
        ...state,
        address
      };
    case 'SET_PUBLIC_BOXES':
      const { items: newPublicBoxes } = action;
      return {
        ...state,
        publicBoxes: newPublicBoxes
      };
    case 'SET_PERSONAL_BOXES':
      const { items: newPersonalBoxes } = action;
      return {
        ...state,
        personalBoxes: newPersonalBoxes
      };
    case 'UPDATE_PUBLIC_BOX':
      const { data: updatedPublicBoxData } = action;
      return {
        ...state,
        publicBoxes: state.publicBoxes.map((item) => {
          if (item.boxAddress === updatedPublicBoxData.boxAddress) {
            return { ...item, ...updatedPublicBoxData };
          } else {
            return item;
          }
        })
      };
    case 'UPDATE_PERSONAL_BOX':
      const { data: updatedPersonalBoxData } = action;
      return {
        ...state,
        personalBoxes: state.personalBoxes.map((item) => {
          if (item.boxAddress === updatedPersonalBoxData.boxAddress) {
            return { ...item, ...updatedPersonalBoxData };
          } else {
            return item;
          }
        })
      };
    case 'ADD_PUBLIC_BOX':
      const { data: publicBoxData } = action;
      return {
        ...state,
        publicBoxes: [publicBoxData, ...state.publicBoxes]
      };
    case 'ADD_PERSONAL_BOX':
      const { data: personalBoxData } = action;
      return {
        ...state,
        personalBoxes: [personalBoxData, ...state.personalBoxes]
      };
    case 'SET_NETWORK':
      const { network } = action;
      return {
        ...state,
        network
      };
    default:
      return state;
  }
};

export { reducer, initialState };
