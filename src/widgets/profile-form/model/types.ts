export interface ProfileFormValues {
  profile: {
    firstName: string
    email: string
    city: string
    bio: string
  }
  settings: {
    isDeveloper: boolean
  }
}

export const PROFILE_FORM_INITIAL_VALUES: ProfileFormValues = {
  profile: {
    firstName: '',
    email: '',
    city: '',
    bio: '',
  },
  settings: {
    isDeveloper: false,
  },
}
